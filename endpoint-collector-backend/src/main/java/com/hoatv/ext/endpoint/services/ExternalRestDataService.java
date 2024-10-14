package com.hoatv.ext.endpoint.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoatv.ext.endpoint.api.ResponseConsumer;
import com.hoatv.ext.endpoint.api.ResponseConsumerType;
import com.hoatv.ext.endpoint.dtos.*;
import com.hoatv.ext.endpoint.models.EndpointExecutionResult;
import com.hoatv.ext.endpoint.models.EndpointResponse;
import com.hoatv.ext.endpoint.models.EndpointSetting;
import com.hoatv.ext.endpoint.repositories.EndpointResponseRepository;
import com.hoatv.ext.endpoint.repositories.EndpointSettingRepository;
import com.hoatv.ext.endpoint.repositories.ExecutionResultRepository;
import com.hoatv.fwk.common.services.CheckedFunction;
import com.hoatv.fwk.common.services.CheckedSupplier;
import com.hoatv.fwk.common.services.HttpClientService.HttpMethod;
import com.hoatv.fwk.common.ultilities.ObjectUtils;
import com.hoatv.fwk.common.ultilities.Pair;
import com.hoatv.metric.mgmt.annotations.Metric;
import com.hoatv.metric.mgmt.annotations.MetricProvider;
import com.hoatv.metric.mgmt.entities.SimpleValue;
import com.hoatv.monitor.mgmt.TimingMetricMonitor;
import com.hoatv.system.health.metrics.MethodStatisticCollector;
import com.hoatv.task.mgmt.entities.TaskEntry;
import com.hoatv.task.mgmt.services.TaskFactory;
import com.hoatv.task.mgmt.services.TaskMgmtService;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.BiConsumer;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import static com.hoatv.ext.endpoint.utils.SaltGeneratorUtils.GeneratorType;
import static com.hoatv.ext.endpoint.utils.SaltGeneratorUtils.getGeneratorMethodFunc;
import static com.hoatv.fwk.common.constants.MetricProviders.OTHER_APPLICATION;

@Service
@MetricProvider(application = OTHER_APPLICATION, category = "External Endpoint Metric Collector")
public class ExternalRestDataService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExternalRestDataService.class);

    private final EndpointSettingRepository endpointSettingRepository;

    private final EndpointResponseRepository endpointResponseRepository;

    private final ExecutionResultRepository executionResultRepository;

    private final MethodStatisticCollector methodStatisticCollector;

    private final ResponseConsumerFactory responseConsumerFactory;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final AtomicInteger numberOfSuccessResponse = new AtomicInteger(0);

    private final AtomicInteger numberOfErrorResponse = new AtomicInteger(0);

    public ExternalRestDataService(EndpointSettingRepository endpointSettingRepository,
                                   EndpointResponseRepository endpointResponseRepository,
                                   ExecutionResultRepository executionResultRepository,
                                   MethodStatisticCollector methodStatisticCollector,
                                   ResponseConsumerFactory responseConsumerFactory) {

        this.endpointSettingRepository = endpointSettingRepository;
        this.endpointResponseRepository = endpointResponseRepository;
        this.executionResultRepository = executionResultRepository;
        this.methodStatisticCollector = methodStatisticCollector;
        this.responseConsumerFactory = responseConsumerFactory;
    }

    private static Pair<EndpointSettingVO, EndpointExecutionResult> apply(EndpointExecutionResult p) {
        EndpointSettingVO endpointSettingVO = p.getEndpointSetting().toEndpointSettingVO();
        return Pair.of(endpointSettingVO, p);
    }

    @Metric(name = "ext-number-of-success-responses")
    public SimpleValue getNumberOfSuccessResponse() {
        return new SimpleValue(numberOfSuccessResponse.get());
    }

    @Metric(name = "ext-number-of-failure-responses")
    public SimpleValue getNumberOfErrorResponse() {
        return new SimpleValue(numberOfErrorResponse.get());
    }
    
    @PostConstruct
    public void init() {
        LOGGER.info("Force collecting data for incomplete tasks of applications");
        List<EndpointExecutionResult> executionResults = executionResultRepository.findByPercentCompleteLessThan(100);
        Map<EndpointSettingVO, EndpointExecutionResult> incompleteTaskMap = executionResults
                .stream()
                .map(ExternalRestDataService::apply)
                .collect(Collectors.toMap(Pair::getKey, Pair::getValue));
        
        incompleteTaskMap.forEach(((endpointSettingVO, executionResult) -> {
            EndpointSetting endpointSetting = executionResult.getEndpointSetting();
            LOGGER.info("Start collecting data for incomplete application: {} - task: {}", endpointSetting.getApplication(), endpointSetting.getTaskName());
            collectDataFromEndpoint(endpointSettingVO, endpointSetting, executionResult);
        }));
    }

    public Long createExternalEndpoint(EndpointSettingVO endpointSettingVO) {
        EndpointSetting endpointSetting = createEndpointSetting(endpointSettingVO);
        int noAttemptTimes = endpointSettingVO.getInput().getNoAttemptTimes();
        EndpointExecutionResult executionResult = createExecutionResult(endpointSetting, noAttemptTimes);
        LOGGER.info("Start collecting data from endpoint for application: {} - task: {}", endpointSetting.getApplication(), endpointSetting.getTaskName());
        return collectDataFromEndpoint(endpointSettingVO, endpointSetting, executionResult);
    }

    private Long collectDataFromEndpoint(
            EndpointSettingVO endpointSettingVO, 
            EndpointSetting endpointSetting, 
            EndpointExecutionResult executionResult) {
        
        TaskMgmtService taskMgmtExecutorV1 = TaskFactory.INSTANCE.getTaskMgmtService(1, 5000);
        TaskEntry mainTaskEntry = new TaskEntry();
        Callable<Object> callable = getEndpointResponseTasks(endpointSetting, endpointSettingVO, executionResult);
        mainTaskEntry.setTaskHandler(callable);
        mainTaskEntry.setApplicationName("Main %s".formatted(endpointSetting.getTaskName()));
        mainTaskEntry.setName("Execute get endpoint response for %s".formatted(endpointSetting.getTaskName()));
        taskMgmtExecutorV1.execute(mainTaskEntry);

        LOGGER.info("Endpoint {} is added successfully", endpointSetting.getExtEndpoint());
        return endpointSetting.getId();
    }

    private EndpointSetting createEndpointSetting(
            EndpointSettingVO endpointSettingVO) {
        EndpointSetting endpointSetting = EndpointSetting.fromEndpointConfigVO(endpointSettingVO);
        HttpMethod extSupportedMethod = HttpMethod.fromString(endpointSetting.getMethod());
        ObjectUtils.checkThenThrow(Objects::isNull, extSupportedMethod, HttpMethod.INVALID_SUPPORTED_METHOD);
        endpointSettingRepository.save(endpointSetting);
        return endpointSetting;
    }

    private Callable<Object> getEndpointResponseTasks(
            EndpointSetting endpointSetting, 
            EndpointSettingVO endpointSettingVO,
            EndpointExecutionResult executionResult) {
        
        // Metadata
        String columnMetadata = endpointSetting.getColumnMetadata();
        CheckedSupplier<MetadataVO> columnMetadataVOSup = () -> objectMapper.readValue(columnMetadata, MetadataVO.class);
        MetadataVO metadataVO = columnMetadataVOSup.get();

        // Job configuration
        String application = endpointSetting.getApplication();
        String taskName = endpointSetting.getTaskName();
        InputVO input = endpointSettingVO.getInput();
        int noAttemptTimes = input.getNoAttemptTimes() - executionResult.getNumberOfCompletedTasks();
        int noParallelThread = endpointSetting.getNoParallelThread();

        // Generator data for executing http methods
        String generatorMethodName = endpointSetting.getGeneratorMethodName();
        Integer generatorSaltLength = endpointSetting.getGeneratorSaltLength();
        String generatorSaltStartWith = Optional.ofNullable(endpointSetting.getGeneratorSaltStartWith()).orElse("");
        DataGeneratorInfoVO dataGeneratorInfo = input.getDataGeneratorInfo();
        GeneratorType generatorType = GeneratorType.valueOf(dataGeneratorInfo.getGeneratorStrategy());
        if (generatorType == GeneratorType.SEQUENCE) {
            long startWithValue = Long.parseLong(generatorSaltStartWith) + executionResult.getNumberOfCompletedTasks();
            generatorSaltStartWith = String.valueOf(startWithValue);
        }

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
                .application(application)
                .noAttemptTimes(noAttemptTimes)
                .executionResult(executionResult)
                .methodStatisticCollector(methodStatisticCollector)
                .noParallelThread(noParallelThread)
                .dataGeneratorVO(dataGeneratorVO)
                .endpointSettingVO(endpointSettingVO)
                .successResponseConsumer(responseBiConsumer)
                .errorResponseConsumer(errorResponseBiConsumer)
                .extExecutionResultRepository(executionResultRepository)
                .build();
        String executorServiceType = input.getExecutorServiceType();
        LOGGER.info("Running endpoint collector: {} with executor : {}", taskName, executorServiceType);
        return TaskExecutionType.valueOf(executorServiceType).getExecutionTasks(executionContext);
    }

    private EndpointExecutionResult createExecutionResult(EndpointSetting endpointSetting, int noAttemptTimes) {
        EndpointExecutionResult executionResult = new EndpointExecutionResult();
        executionResult.setEndpointSetting(endpointSetting);
        executionResult.setNumberOfTasks(noAttemptTimes);
        executionResultRepository.save(executionResult);
        return executionResult;
    }

    @TimingMetricMonitor
    public Page<EndpointResponseVO> getEndpointResponses(Long endpointId, Pageable pageable) {

        Optional<EndpointSetting> endpointSettingsOp = endpointSettingRepository.findById(endpointId);
        EndpointSetting endpointSetting = endpointSettingsOp
                .orElseThrow(() -> new EntityNotFoundException("Endpoint ID %s is not found".formatted(endpointId)));
        Page<EndpointResponse> responses = endpointResponseRepository.
                findByEndpointSetting(endpointSetting, pageable);
        return responses.map(EndpointResponse::toEndpointResponseVO);
    }


    @TimingMetricMonitor
    public Page<EndpointResponseVO> getEndpointResponses(String application, Pageable pageable) {

        Page<EndpointSetting> endpointSettings = endpointSettingRepository.findEndpointConfigsByApplication(
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
            Page<EndpointSetting> endpointSettings = endpointSettingRepository.findAll(pageable);
            return endpointSettings.map(p -> {
                EndpointExecutionResult byEndpointSetting = executionResultRepository.findByEndpointSetting(p);
                String elapsedTime = Optional.ofNullable(byEndpointSetting)
                        .map(EndpointExecutionResult::getElapsedTime)
                        .orElse(null);
                Integer numberOfCompletedTasks = Optional.ofNullable(byEndpointSetting)
                        .map(EndpointExecutionResult::getNumberOfCompletedTasks)
                        .orElse(0);
                Integer percentCompleted = Optional.ofNullable(byEndpointSetting)
                        .map(EndpointExecutionResult::getPercentComplete)
                        .orElse(0);
                return p.toEndpointSummaryVO()
                        .elapsedTime(elapsedTime)
                        .numberOfCompletedTasks(numberOfCompletedTasks)
                        .percentCompleted(percentCompleted)
                        .build();
            });
        }
        
        Page<EndpointSetting> endpointConfigsByApplication = endpointSettingRepository.findEndpointConfigsByApplication(application, pageable);
        return endpointConfigsByApplication.map(p -> {
            EndpointExecutionResult byEndpointSetting = executionResultRepository.findByEndpointSetting(p);
            String elapsedTime = byEndpointSetting == null ? null : byEndpointSetting.getElapsedTime();
            return p.toEndpointSummaryVO().elapsedTime(elapsedTime).build();
        });
    }

    @TimingMetricMonitor
    public boolean deleteEndpoint(Long endpointId) {

        Optional<EndpointSetting> endpointSettingsOp = endpointSettingRepository.findById(endpointId);
        EndpointSetting endpointSetting = endpointSettingsOp
                .orElseThrow(() -> new EntityNotFoundException("Endpoint ID %s is not found".formatted(endpointId)));
        executionResultRepository.deleteByEndpointSetting(endpointSetting);
        endpointSettingRepository.deleteById(endpointId);
        return true;
    }

    public EndpointSettingVO getEndpointSetting(Long endpointId) {
        Optional<EndpointSetting> endpointSettingsOp = endpointSettingRepository.findById(endpointId);
        return endpointSettingsOp
                .orElseThrow(() -> new EntityNotFoundException("Endpoint ID %s is not found".formatted(endpointId)))
                .toEndpointSettingVO();
    }
}
