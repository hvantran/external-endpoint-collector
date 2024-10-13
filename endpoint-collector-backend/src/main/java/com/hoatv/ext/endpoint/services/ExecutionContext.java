package com.hoatv.ext.endpoint.services;

import com.hoatv.ext.endpoint.dtos.DataGeneratorVO;
import com.hoatv.ext.endpoint.dtos.EndpointSettingVO;
import com.hoatv.ext.endpoint.dtos.InputVO;
import com.hoatv.ext.endpoint.models.EndpointExecutionResult;
import com.hoatv.ext.endpoint.repositories.ExecutionResultRepository;
import com.hoatv.system.health.metrics.MethodStatisticCollector;
import lombok.Builder;

import java.util.function.BiConsumer;

@Builder
public class ExecutionContext {
    EndpointSettingVO endpointSettingVO;

    String application;

    String taskName;

    InputVO input;

    int noAttemptTimes;

    int noParallelThread;

    DataGeneratorVO dataGeneratorVO;

    EndpointExecutionResult executionResult;

    BiConsumer<String, String> successResponseConsumer;

    MethodStatisticCollector methodStatisticCollector;

    ExecutionResultRepository extExecutionResultRepository;

    BiConsumer<String, String> errorResponseConsumer;
}
