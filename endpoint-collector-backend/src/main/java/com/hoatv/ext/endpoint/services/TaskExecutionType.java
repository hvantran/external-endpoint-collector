package com.hoatv.ext.endpoint.services;

import com.hoatv.ext.endpoint.api.TaskExecutionImplementation;
import com.hoatv.ext.endpoint.dtos.DataGeneratorVO;
import com.hoatv.ext.endpoint.dtos.EndpointSettingVO;
import com.hoatv.ext.endpoint.dtos.ExtTaskReportVO;
import com.hoatv.ext.endpoint.dtos.InputVO;
import com.hoatv.ext.endpoint.models.EndpointExecutionResult;
import com.hoatv.ext.endpoint.repositories.ExecutionResultRepository;
import com.hoatv.ext.endpoint.utils.SaltGeneratorUtils;
import com.hoatv.fwk.common.services.*;
import com.hoatv.system.health.metrics.MethodStatisticCollector;
import com.hoatv.task.mgmt.entities.TaskEntry;
import com.hoatv.task.mgmt.services.TaskFactory;
import com.hoatv.task.mgmt.services.TaskMgmtService;
import com.hoatv.task.mgmt.services.TaskMgmtServiceV1;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletableFuture;
import java.util.function.BiConsumer;

public enum TaskExecutionType implements TaskExecutionImplementation {

    EXECUTE_WITH_EXECUTOR_SERVICE {
        @Override
        public Callable<Object> getExecutionTasks(ExecutionContext executionContext) {

            LOGGER.info("Context: {}", executionContext);
            return () -> {
                String application = executionContext.application;
                InputVO input = executionContext.input;
                int noParallelThread = executionContext.noParallelThread;
                int noAttemptTimes = executionContext.noAttemptTimes;
                int noCompletedTasks = executionContext.noOfCompletedTasks;
                EndpointSettingVO endpointSettingVO = executionContext.endpointSettingVO;
                BiConsumer<String, String> responseConsumer = executionContext.successResponseConsumer;
                BiConsumer<String, String> errorResponseConsumer = executionContext.errorResponseConsumer;
                MethodStatisticCollector methodStatisticCollector = executionContext.methodStatisticCollector;
                DataGeneratorVO dataGeneratorVO = executionContext.dataGeneratorVO;
                String taskName = executionContext.taskName;
                ExecutionResultRepository extExecutionResultRepository = executionContext.extExecutionResultRepository;
                EndpointExecutionResult executionResult = executionContext.executionResult;


                try (GenericHttpClientPool httpClientPool = HttpClientFactory.INSTANCE.getGenericHttpClientPool(input.getTaskName(), noParallelThread, 2000);
                    TaskMgmtService taskMgmtExecutorV2 = TaskFactory.INSTANCE.getTaskMgmtService(noParallelThread, 5000, application)) {
                    for (int index = noCompletedTasks + 1; index <= noAttemptTimes; index++) {

                        String executionTaskName = taskName.concat(String.valueOf(index));
                        ExternalTaskEntry externalTaskEntry = ExternalTaskEntry.builder()
                                .input(input)
                                .index(index - noCompletedTasks)
                                .methodStatisticCollector(methodStatisticCollector)
                                .httpClientPool(httpClientPool)
                                .dataGeneratorVO(dataGeneratorVO)
                                .filter(endpointSettingVO.getFilter())
                                .onSuccessResponse(responseConsumer)
                                .onErrorResponse(errorResponseConsumer)
                                .build();

                        CheckedFunction<Object, TaskEntry> taskEntryFunc = TaskEntry.fromObject(executionTaskName,
                                application);
                        TaskEntry taskEntry = taskEntryFunc.apply(externalTaskEntry);
                        taskMgmtExecutorV2.execute(taskEntry);
                        savePercentComplete(extExecutionResultRepository, executionResult, index);
                    }
                }
                LOGGER.info("{} is completed successfully.", taskName);
                return null;
            };
        }
    },
    EXECUTE_WITH_COMPLETABLE_FUTURE {
        @Override
        public Callable<Object> getExecutionTasks(ExecutionContext executionContext) {

            LOGGER.info("Context: {}", executionContext);
            return () -> {
                String application = executionContext.application;
                InputVO input = executionContext.input;
                int noParallelThread = executionContext.noParallelThread;
                int noAttemptTimes = executionContext.noAttemptTimes;
                int noCompletedTasks = executionContext.noOfCompletedTasks;
                EndpointSettingVO endpointSettingVO = executionContext.endpointSettingVO;
                BiConsumer<String, String> responseConsumer = executionContext.successResponseConsumer;
                BiConsumer<String, String> errorResponseConsumer = executionContext.errorResponseConsumer;
                MethodStatisticCollector methodStatisticCollector = executionContext.methodStatisticCollector;
                DataGeneratorVO dataGeneratorVO = executionContext.dataGeneratorVO;
                String taskName = executionContext.taskName;
                ExecutionResultRepository executionResultRepository = executionContext.extExecutionResultRepository;
                EndpointExecutionResult executionResult = executionContext.executionResult;

                int numberOfProcess = Runtime.getRuntime().availableProcessors();

                String extEndpoint = input.getRequestInfo().getExtEndpoint();
                String endpointMethod = input.getRequestInfo().getMethod();
                String data = input.getRequestInfo().getData();
                Map<String, String> headers = input.getRequestInfo().getHeaders();
                String successResponseFilter = endpointSettingVO.getFilter().getSuccessCriteria();
                HttpClientService.HttpMethod extSupportedMethod = HttpClientService.HttpMethod.valueOf(endpointMethod);

                try (GenericHttpClientPool httpClientPool = HttpClientFactory.INSTANCE.getGenericHttpClientPool(input.getTaskName(), noParallelThread, 2000);
                     TaskMgmtServiceV1 cpuBoundThreadPool = TaskFactory.INSTANCE.getTaskMgmtServiceV1(numberOfProcess, 5000,
                             "CPU-" + application);
                     TaskMgmtServiceV1 httpClientThreadPool = TaskFactory.INSTANCE.getTaskMgmtServiceV1(
                             noParallelThread, 5000, application)) {
                    for (int index = noCompletedTasks + 1; index <= noAttemptTimes; index++) {
                        int finalIndex = index;
                        CompletableFuture.supplyAsync(() -> {
                                    CheckedSupplier<String> supplier = () -> SaltGeneratorUtils.generateSaltValue(
                                            dataGeneratorVO, finalIndex);
                                    ExtTaskReportVO extTaskReportVO = new ExtTaskReportVO(System.currentTimeMillis());
                                    extTaskReportVO.setAttemptValue(supplier.get());
                                    return extTaskReportVO;
                                }, cpuBoundThreadPool)
                                .thenApplyAsync(extTaskReportVO -> {
                                    String attemptValue = extTaskReportVO.getAttemptValue();
                                    GenericHttpClientPool.ExecutionTemplate<String> executionTemplate = ExternalTaskEntry.getExecutionTemplate(
                                            extEndpoint, extSupportedMethod, data, attemptValue, headers);
                                    String result = httpClientPool.executeWithTemplate(executionTemplate);
                                    extTaskReportVO.setExecutionResult(result);
                                    return extTaskReportVO;
                                }, httpClientThreadPool).thenAccept(extTaskReportVO -> {
                                    String random = extTaskReportVO.getAttemptValue();
                                    String responseString = extTaskReportVO.getExecutionResult();

                                    if (StringUtils.isNotEmpty(responseString) && responseString.contains(successResponseFilter)) {
                                        responseConsumer.accept(random, responseString);
                                    } else {
                                        errorResponseConsumer.accept(random, responseString);
                                    }
                                    extTaskReportVO.setEndTime(System.currentTimeMillis());
                                    long elapsedTime = extTaskReportVO.getElapsedTime();
                                    methodStatisticCollector.addMethodStatistics("endpoint-processing-data-task", "ms",
                                            elapsedTime);
                                });
                        savePercentComplete(executionResultRepository, executionResult, index);
                    }
                    LOGGER.info("{} is completed successfully.", taskName);
                    return null;
                }
            };
        }
    };

    private static final Logger LOGGER = LoggerFactory.getLogger(TaskExecutionType.class);

    void savePercentComplete(ExecutionResultRepository executionResultRepository, 
                             EndpointExecutionResult executionResult, int index) {

        int percentComplete = executionResult.getPercentComplete();
        int nextPercentComplete = index * 100 / executionResult.getNumberOfTasks();

        if (percentComplete != nextPercentComplete) {
            executionResult.setNumberOfCompletedTasks(index);
            executionResult.setPercentComplete(nextPercentComplete);
            executionResultRepository.save(executionResult);
        }
    }
}
