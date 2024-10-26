package com.hoatv.ext.endpoint.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoatv.ext.endpoint.api.ResponseConsumer;
import com.hoatv.ext.endpoint.api.ResponseConsumerType;
import com.hoatv.ext.endpoint.dtos.*;
import com.hoatv.ext.endpoint.models.EndpointExecutionResult;
import com.hoatv.ext.endpoint.models.EndpointResponse;
import com.hoatv.ext.endpoint.models.EndpointSetting;
import com.hoatv.ext.endpoint.models.ExecutionState;
import com.hoatv.ext.endpoint.repositories.CustomEndpointResponseRepository;
import com.hoatv.ext.endpoint.repositories.EndpointResponseRepository;
import com.hoatv.ext.endpoint.repositories.EndpointSettingRepository;
import com.hoatv.ext.endpoint.repositories.ExecutionResultRepository;
import com.hoatv.ext.endpoint.utils.ExpressionUtils;
import com.hoatv.fwk.common.services.CheckedFunction;
import com.hoatv.fwk.common.services.CheckedSupplier;
import com.hoatv.fwk.common.services.HttpClientFactory;
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
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
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
    public static final String ENDPOINT_ID_NOT_FOUND = "Endpoint ID %s is not found";

    private final EndpointSettingRepository endpointSettingRepository;

    private final EndpointResponseRepository endpointResponseRepository;

    private final ExecutionResultRepository executionResultRepository;

    private final MethodStatisticCollector methodStatisticCollector;

    private final ResponseConsumerFactory responseConsumerFactory;

    private final CustomEndpointResponseRepository customEndpointResponseRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, TaskMgmtService> activeEndpointTaskMap = new ConcurrentHashMap<>();

    private final AtomicInteger numberOfSuccessResponse = new AtomicInteger(0);

    private final AtomicInteger numberOfErrorResponse = new AtomicInteger(0);

    public ExternalRestDataService(EndpointSettingRepository endpointSettingRepository,
                                   EndpointResponseRepository endpointResponseRepository,
                                   ExecutionResultRepository executionResultRepository,
                                   MethodStatisticCollector methodStatisticCollector,
                                   ResponseConsumerFactory responseConsumerFactory,
                                   CustomEndpointResponseRepository customEndpointResponseRepository) {

        this.endpointSettingRepository = endpointSettingRepository;
        this.endpointResponseRepository = endpointResponseRepository;
        this.executionResultRepository = executionResultRepository;
        this.methodStatisticCollector = methodStatisticCollector;
        this.responseConsumerFactory = responseConsumerFactory;
        this.customEndpointResponseRepository = customEndpointResponseRepository;
    }

    @Metric(name = "ext-number-of-success-responses")
    public SimpleValue getNumberOfSuccessResponse() {
        return new SimpleValue(numberOfSuccessResponse.get());
    }

    @Metric(name = "ext-number-of-failure-responses")
    public SimpleValue getNumberOfErrorResponse() {
        return new SimpleValue(numberOfErrorResponse.get());
    }

    private static Pair<EndpointSettingVO, EndpointExecutionResult> apply(EndpointExecutionResult p) {
        EndpointSettingVO endpointSettingVO = p.getEndpointSetting().toEndpointSettingVO();
        return Pair.of(endpointSettingVO, p);
    }

    @PostConstruct
    public void init() {
        LOGGER.info("Force collecting data for incomplete tasks of applications");
        List<EndpointExecutionResult> executionResults = executionResultRepository
                .findByPercentCompleteLessThanAndState(100, ExecutionState.ACTIVE);
        Map<EndpointSettingVO, EndpointExecutionResult> incompleteTaskMap = executionResults
                .stream()
                .map(ExternalRestDataService::apply)
                .collect(Collectors.toMap(Pair::getKey, Pair::getValue));

        incompleteTaskMap.forEach(((endpointSettingVO, executionResult) -> {
            EndpointSetting endpointSetting = executionResult.getEndpointSetting();
            Long endpointSettingId = endpointSetting.getId();
            String columnMetadata = endpointSetting.getColumnMetadata();
            MetadataVO metadataVO = getMetadataVO(columnMetadata);
            String generatorSaltStartWith = endpointSetting.getGeneratorSaltStartWith();
            String lastRandomValue = getLastRandomValue(metadataVO, endpointSettingId, generatorSaltStartWith);
            int numberOfCompletedTasks = getNumberOfCompletedTasks(lastRandomValue, generatorSaltStartWith);
            collectDataFromEndpoint(endpointSettingVO, endpointSetting, executionResult, numberOfCompletedTasks);
        }));
    }

    private MetadataVO getMetadataVO(String columnMetadata) {
        CheckedSupplier<MetadataVO> columnMetadataVOSup = () -> objectMapper.readValue(columnMetadata, MetadataVO.class);
        return columnMetadataVOSup.get();
    }

    private String getLastRandomValue(MetadataVO metadataVO, Long endpointSettingId, String generatorSaltStartWith) {
        return metadataVO.getColumnMetadata().stream()
                .filter(p -> "random".equals(p.getFieldPath()))
                .findFirst().map(columnMetadataVO -> {
                    String mappingColumnName = columnMetadataVO.getMappingColumnName();
                    return customEndpointResponseRepository.findMaxValueByColumn(mappingColumnName, endpointSettingId);
                }).orElse(generatorSaltStartWith);
    }

    private int getNumberOfCompletedTasks(
            String lastRandomValue,
            String generateSaltStartWith) {
        String lastRandomNumericOnly = lastRandomValue.replaceAll("\\D", "");
        String saltNumericOnly = generateSaltStartWith.replaceAll("\\D", "");
        return Integer.parseInt(lastRandomNumericOnly) - Integer.parseInt(saltNumericOnly);
    }

    public Long createExternalEndpoint(EndpointSettingVO endpointSettingVO) {
        EndpointSetting endpointSetting = createEndpointSetting(endpointSettingVO);
        int noAttemptTimes = endpointSettingVO.getInput().getNoAttemptTimes();
        EndpointExecutionResult executionResult = createExecutionResult(endpointSetting, noAttemptTimes);
        return collectDataFromEndpoint(endpointSettingVO, endpointSetting, executionResult, 0);
    }

    private Long collectDataFromEndpoint(
            EndpointSettingVO endpointSettingVO,
            EndpointSetting endpointSetting,
            EndpointExecutionResult executionResult,
            int numberOfCompletedTasks) {

        LOGGER.info("Start collecting data from endpoint for application: {} - task: {} - from: {} - {}",
                endpointSetting.getApplication(),
                endpointSetting.getTaskName(),
                numberOfCompletedTasks,
                endpointSetting.getNoAttemptTimes());
        TaskMgmtService taskMgmtExecutorV1 = TaskFactory.INSTANCE.getTaskMgmtService(1, 5000);
        TaskEntry mainTaskEntry = new TaskEntry();
        Callable<Object> callable = getEndpointResponseTasks(endpointSetting, endpointSettingVO, executionResult, numberOfCompletedTasks);
        mainTaskEntry.setTaskHandler(callable);
        mainTaskEntry.setApplicationName("Main %s".formatted(endpointSetting.getTaskName()));
        mainTaskEntry.setName("Execute get endpoint response for %s".formatted(endpointSetting.getTaskName()));
        taskMgmtExecutorV1.execute(mainTaskEntry);

        LOGGER.info("Endpoint {} is added successfully", endpointSetting.getExtEndpoint());
        activeEndpointTaskMap.put(endpointSetting.getTaskName(), taskMgmtExecutorV1);
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
            EndpointExecutionResult executionResult,
            int numberOfCompletedTasks) {

        // Metadata
        String columnMetadata = endpointSetting.getColumnMetadata();
        MetadataVO metadataVO = getMetadataVO(columnMetadata);

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

        if (generatorType == GeneratorType.SEQUENCE) {
            long startWithValue = Long.parseLong(generatorSaltStartWith) + numberOfCompletedTasks;
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
                .noOfCompletedTasks(numberOfCompletedTasks)
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
                .orElseThrow(() -> new EntityNotFoundException(ENDPOINT_ID_NOT_FOUND.formatted(endpointId)));
        Page<EndpointResponse> responses = endpointResponseRepository.
                findByEndpointSetting(endpointSetting, pageable);
        return responses.map(EndpointResponse::toEndpointResponseVO);
    }

    @TimingMetricMonitor
    public Page<EndpointResponseVO> getEndpointResponses(TableSearchVO tableSearchVO, PageRequest pageable) {
        Page<EndpointResponse> responses = Optional.ofNullable(tableSearchVO)
                .map(getEndpointResponseExample())
                .map(example -> endpointResponseRepository.findAll(example, pageable))
                .orElseGet(() -> endpointResponseRepository.findAll(pageable));
        return responses.map(EndpointResponse::toEndpointResponseVO);
    }

    private CheckedFunction<TableSearchVO, Example<EndpointResponse>> getEndpointResponseExample() {
        return tableSearchVO -> {
            EndpointResponse endpointResponse = new EndpointResponse();
            return ExpressionUtils.getExample(tableSearchVO, endpointResponse);
        };
    }


    @TimingMetricMonitor
    @Transactional
    public Page<EndpointSettingOverviewVO> getAllExtEndpoints(Pageable pageable) {
        Page<EndpointSettingRepository.EndpointSettingOverview> endpointSettings =
                endpointSettingRepository.findEndpointSettingOverview(pageable);
        return endpointSettings.map(p -> {
            EndpointSetting endpointSetting = p.getEndpointSetting();
            LocalDateTime createdAt = endpointSetting.getCreatedAt();
            return EndpointSettingOverviewVO.builder()
                    .endpointId(endpointSetting.getId())
                    .application(p.getApplication())
                    .taskName(p.getTaskName())
                    .elapsedTime(p.getElapsedTime())
                    .targetURL(p.getTargetURL())
                    .state(p.getState())
                    .numberOfCompletedTasks(p.getNumberOfCompletedTasks())
                    .numberOfResponses(p.getNumberOfResponses())
                    .createdAt(Objects.isNull(createdAt) ? "" : createdAt.format(DateTimeFormatter.ISO_DATE_TIME))
                    .percentCompleted(p.getPercentCompleted())
                    .build();
        });
    }

    @TimingMetricMonitor
    public boolean deleteEndpoint(Long endpointId) {

        Optional<EndpointSetting> endpointSettingsOp = endpointSettingRepository.findById(endpointId);
        EndpointSetting endpointSetting = endpointSettingsOp
                .orElseThrow(() -> new EntityNotFoundException(ENDPOINT_ID_NOT_FOUND.formatted(endpointId)));
        executionResultRepository.deleteByEndpointSetting(endpointSetting);
        endpointSettingRepository.deleteById(endpointId);
        return true;
    }

    public EndpointSettingVO getEndpointSetting(Long endpointId) {
        Optional<EndpointSetting> endpointSettingsOp = endpointSettingRepository.findById(endpointId);
        return endpointSettingsOp
                .orElseThrow(() -> new EntityNotFoundException(ENDPOINT_ID_NOT_FOUND.formatted(endpointId)))
                .toEndpointSettingVO();
    }

    public void updateEndpointSetting(
            Long endpointId,
            PatchEndpointSettingVO patchEndpointSettingVO) {

        ExecutionState nextExecutionState = patchEndpointSettingVO.getState();
        Optional<EndpointSetting> endpointSettingsOp = endpointSettingRepository.findById(endpointId);
        EndpointSetting endpointSetting = endpointSettingsOp
                .orElseThrow(() -> new EntityNotFoundException(ENDPOINT_ID_NOT_FOUND.formatted(endpointId)));
        EndpointExecutionResult executionResult = executionResultRepository.findByEndpointSetting(endpointSetting);
        ObjectUtils.checkThenThrow(executionResult.getState() == ExecutionState.END, "Endpoint is ended");
        ObjectUtils.checkThenThrow(executionResult.getState() == nextExecutionState, "Endpoint is already in state");

        executionResult.setState(nextExecutionState);
        String application = endpointSetting.getApplication();
        String taskName = endpointSetting.getTaskName();
        if (nextExecutionState == ExecutionState.PAUSED) {
            TaskMgmtService taskMgmtService = activeEndpointTaskMap.get(taskName);
            TaskFactory.INSTANCE.destroy("TaskMgmtService", taskMgmtService);
            TaskFactory.INSTANCE.destroy(application);
            HttpClientFactory.INSTANCE.destroy(taskName);
            executionResult.setState(ExecutionState.PAUSED);
            executionResultRepository.save(executionResult);
            try (var ignored = activeEndpointTaskMap.remove(taskName)) {
                LOGGER.info("Endpoint application: {} - {} has been paused successfully", application, taskName);
            }
            return;
        }
        if (nextExecutionState == ExecutionState.ACTIVE) {
            EndpointSettingVO endpointSettingVO = endpointSetting.toEndpointSettingVO();
            MetadataVO metadataVO = getMetadataVO(endpointSetting.getColumnMetadata());
            String generatorSaltStartWith = endpointSetting.getGeneratorSaltStartWith();
            String lastRandomValue = getLastRandomValue(metadataVO, endpointSetting.getId(), generatorSaltStartWith);
            int numberOfCompletedTasks = getNumberOfCompletedTasks(lastRandomValue, generatorSaltStartWith);
            collectDataFromEndpoint(endpointSettingVO, endpointSetting, executionResult, numberOfCompletedTasks);
            LOGGER.info("Endpoint application: {} - {} has been resume successfully", application, taskName);
            return;
        }
        throw new UnsupportedOperationException("Unsupported operation for " + patchEndpointSettingVO);
    }
}
