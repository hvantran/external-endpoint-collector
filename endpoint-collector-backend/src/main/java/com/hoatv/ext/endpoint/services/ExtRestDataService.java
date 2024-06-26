package com.hoatv.ext.endpoint.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoatv.ext.endpoint.api.ResponseConsumer;
import com.hoatv.ext.endpoint.api.ResponseConsumerType;
import com.hoatv.ext.endpoint.dtos.*;
import com.hoatv.ext.endpoint.models.EndpointExecutionResult;
import com.hoatv.ext.endpoint.models.EndpointResponse;
import com.hoatv.ext.endpoint.models.EndpointSetting;
import com.hoatv.ext.endpoint.repositories.ExtEndpointResponseRepository;
import com.hoatv.ext.endpoint.repositories.ExtEndpointSettingRepository;
import com.hoatv.ext.endpoint.repositories.ExtExecutionResultRepository;
import com.hoatv.fwk.common.services.CheckedFunction;
import com.hoatv.fwk.common.services.CheckedSupplier;
import com.hoatv.fwk.common.services.HttpClientService.HttpMethod;
import com.hoatv.fwk.common.ultilities.ObjectUtils;
import com.hoatv.metric.mgmt.annotations.Metric;
import com.hoatv.metric.mgmt.annotations.MetricProvider;
import com.hoatv.metric.mgmt.entities.SimpleValue;
import com.hoatv.monitor.mgmt.TimingMetricMonitor;
import com.hoatv.system.health.metrics.MethodStatisticCollector;
import com.hoatv.task.mgmt.entities.TaskEntry;
import com.hoatv.task.mgmt.services.TaskFactory;
import com.hoatv.task.mgmt.services.TaskMgmtService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.BiConsumer;
import java.util.function.Predicate;

import static com.hoatv.ext.endpoint.utils.SaltGeneratorUtils.GeneratorType;
import static com.hoatv.ext.endpoint.utils.SaltGeneratorUtils.getGeneratorMethodFunc;
import static com.hoatv.fwk.common.constants.MetricProviders.OTHER_APPLICATION;

@Service
@MetricProvider(application = OTHER_APPLICATION, category = "External Endpoint Metric Collector")
public class ExtRestDataService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExtRestDataService.class);

    private final ExtEndpointSettingRepository extEndpointSettingRepository;

    private final ExtEndpointResponseRepository endpointResponseRepository;

    private final ExtExecutionResultRepository extExecutionResultRepository;

    private final MethodStatisticCollector methodStatisticCollector;

    private final ResponseConsumerFactory responseConsumerFactory;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final AtomicInteger numberOfSuccessResponse = new AtomicInteger(0);

    private final AtomicInteger numberOfErrorResponse = new AtomicInteger(0);

    public ExtRestDataService(ExtEndpointSettingRepository extEndpointSettingRepository,
                              ExtEndpointResponseRepository endpointResponseRepository,
                              ExtExecutionResultRepository extExecutionResultRepository,
                              MethodStatisticCollector methodStatisticCollector,
                              ResponseConsumerFactory responseConsumerFactory) {

        this.extEndpointSettingRepository = extEndpointSettingRepository;
        this.endpointResponseRepository = endpointResponseRepository;
        this.extExecutionResultRepository = extExecutionResultRepository;
        this.methodStatisticCollector = methodStatisticCollector;
        this.responseConsumerFactory = responseConsumerFactory;
    }

    @Metric(name = "ext-number-of-success-responses")
    public SimpleValue getNumberOfSuccessResponse() {

        return new SimpleValue(numberOfSuccessResponse.get());
    }

    @Metric(name = "ext-number-of-failure-responses")
    public SimpleValue getNumberOfErrorResponse() {

        return new SimpleValue(numberOfErrorResponse.get());
    }

    public Long addExtEndpoint(EndpointSettingVO endpointSettingVO) {

        EndpointSetting endpointSetting = EndpointSetting.fromEndpointConfigVO(endpointSettingVO);
        HttpMethod extSupportedMethod = HttpMethod.fromString(endpointSetting.getMethod());
        ObjectUtils.checkThenThrow(Objects::isNull, extSupportedMethod, HttpMethod.INVALID_SUPPORTED_METHOD);

        extEndpointSettingRepository.save(endpointSetting);
        TaskMgmtService taskMgmtExecutorV1 = TaskFactory.INSTANCE.getTaskMgmtService(1, 5000);
        TaskEntry mainTaskEntry = new TaskEntry();
        Callable<Object> callable = getEndpointResponseTasks(endpointSetting, endpointSettingVO);
        mainTaskEntry.setTaskHandler(callable);
        mainTaskEntry.setApplicationName("Main");
        mainTaskEntry.setName("Execute get endpoint response");
        taskMgmtExecutorV1.execute(mainTaskEntry);

        LOGGER.info("Endpoint {} is added successfully", endpointSetting.getExtEndpoint());
        return endpointSetting.getId();
    }

    private Callable<Object> getEndpointResponseTasks(EndpointSetting endpointSetting, EndpointSettingVO endpointSettingVO) {
        // Metadata
        String columnMetadata = endpointSetting.getColumnMetadata();
        CheckedSupplier<MetadataVO> columnMetadataVOSup = () -> objectMapper.readValue(columnMetadata, MetadataVO.class);
        MetadataVO metadataVO = columnMetadataVOSup.get();

        // Job configuration
        String application = endpointSetting.getApplication();
        String taskName = endpointSetting.getTaskName();
        InputVO input = endpointSettingVO.getInput();
        int noAttemptTimes = input.getNoAttemptTimes();
        int noParallelThread = endpointSetting.getNoParallelThread();

        // Generator data for executing http methods
        String generatorMethodName = endpointSetting.getGeneratorMethodName();
        Integer generatorSaltLength = endpointSetting.getGeneratorSaltLength();
        String generatorSaltStartWith = Optional.ofNullable(endpointSetting.getGeneratorSaltStartWith()).orElse("");
        DataGeneratorInfoVO dataGeneratorInfo = input.getDataGeneratorInfo();
        GeneratorType generatorType = GeneratorType.valueOf(dataGeneratorInfo.getGeneratorStrategy());

        CheckedFunction<String, Method> generatorMethodFunc = getGeneratorMethodFunc(generatorSaltStartWith);
        Predicate<String> existingDataChecker = endpointResponseRepository::existsEndpointResponseByColumn1;
        DataGeneratorVO dataGeneratorVO = DataGeneratorVO.builder()
                .generatorMethodFunc(generatorMethodFunc)
                .generatorMethodName(generatorMethodName)
                .generatorSaltLength(generatorSaltLength)
                .generatorSaltStartWith(generatorSaltStartWith)
                .generatorType(generatorType)
                .checkExistingFunc(existingDataChecker)
                .build();

        EndpointExecutionResult executionResult = new EndpointExecutionResult();
        executionResult.setEndpointSetting(endpointSetting);
        executionResult.setNumberOfTasks(noAttemptTimes);
        extExecutionResultRepository.save(executionResult);

        OutputVO output = endpointSettingVO.getOutput();
        String responseConsumerTypeName = output.getResponseConsumerType().toUpperCase();
        ResponseConsumerType responseConsumerType = ResponseConsumerType.valueOf(responseConsumerTypeName);
        ResponseConsumer responseConsumer = responseConsumerFactory.getResponseConsumer(responseConsumerType);
        BiConsumer<String, String> responseBiConsumer = responseConsumer.onSuccessResponse(metadataVO,
                endpointSetting).andThen((random, response) -> numberOfSuccessResponse.incrementAndGet());

        BiConsumer<String, String> errorResponseBiConsumer = responseConsumer.onErrorResponse()
                .andThen((random, response) -> numberOfErrorResponse.incrementAndGet());

        ExecutionContext executionContext = ExecutionContext.builder()
                .input(input)
                .taskName(taskName)
                .executionResult(executionResult)
                .application(application)
                .noAttemptTimes(noAttemptTimes)
                .executionResult(executionResult)
                .methodStatisticCollector(methodStatisticCollector)
                .noParallelThread(noParallelThread)
                .dataGeneratorVO(dataGeneratorVO)
                .endpointSettingVO(endpointSettingVO)
                .successResponseConsumer(responseBiConsumer)
                .errorResponseConsumer(errorResponseBiConsumer)
                .extExecutionResultRepository(extExecutionResultRepository)
                .build();
        String executorServiceType = input.getExecutorServiceType();
        LOGGER.info("Running endpoint collector: {} with executor : {}", taskName, executorServiceType);
        return TaskExecutionType.valueOf(executorServiceType).getExecutionTasks(executionContext);
    }

    @TimingMetricMonitor
    public Page<EndpointResponseVO> getEndpointResponses(Long endpointId, Pageable pageable) {

        Optional<EndpointSetting> endpointSettingsOp = extEndpointSettingRepository.findById(endpointId);
        EndpointSetting endpointSetting = endpointSettingsOp
                .orElseThrow(() -> new EntityNotFoundException("Endpoint ID %s is not found".formatted(endpointId)));
        Page<EndpointResponse> responses = endpointResponseRepository.
                findByEndpointSetting(endpointSetting, pageable);
        return responses.map(EndpointResponse::toEndpointResponseVO);
    }


    @TimingMetricMonitor
    public Page<EndpointResponseVO> getEndpointResponses(String application, Pageable pageable) {

        Page<EndpointSetting> endpointSettings = extEndpointSettingRepository.findEndpointConfigsByApplication(
                application, PageRequest.of(0, 10));
        if (endpointSettings.isEmpty()) {
            return Page.empty();
        }
        Page<EndpointResponse> responses = endpointResponseRepository.findByEndpointSettingIn(
                endpointSettings.stream().toList(), pageable);
        return responses.map(EndpointResponse::toEndpointResponseVO);
    }

    @TimingMetricMonitor
    @Transactional
    public Page<EndpointSummaryVO> getAllExtEndpoints(String application, Pageable pageable) {

        if (Objects.isNull(application)) {
            Page<EndpointSetting> endpointSettings = extEndpointSettingRepository.findAll(pageable);
            return endpointSettings.map(p -> {
                EndpointExecutionResult byEndpointSetting = extExecutionResultRepository.findByEndpointSetting(p);
                String elapsedTime = byEndpointSetting == null ? null : byEndpointSetting.getElapsedTime();
                return p.toEndpointSummaryVO().elapsedTime(elapsedTime).build();
            });
        }
        Page<EndpointSetting> endpointConfigsByApplication = extEndpointSettingRepository.findEndpointConfigsByApplication(application, pageable);
        return endpointConfigsByApplication.map(p -> {
            EndpointExecutionResult byEndpointSetting = extExecutionResultRepository.findByEndpointSetting(p);
            String elapsedTime = byEndpointSetting == null ? null : byEndpointSetting.getElapsedTime();
            return p.toEndpointSummaryVO().elapsedTime(elapsedTime).build();
        });
    }

    @TimingMetricMonitor
    public boolean deleteEndpoint(Long endpointId) {

        Optional<EndpointSetting> endpointSettingsOp = extEndpointSettingRepository.findById(endpointId);
        EndpointSetting endpointSetting = endpointSettingsOp
                .orElseThrow(() -> new EntityNotFoundException("Endpoint ID %s is not found".formatted(endpointId)));
        extExecutionResultRepository.deleteByEndpointSetting(endpointSetting);
        extEndpointSettingRepository.deleteById(endpointId);
        return true;
    }
}
