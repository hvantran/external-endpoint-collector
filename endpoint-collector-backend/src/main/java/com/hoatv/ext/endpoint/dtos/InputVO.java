package com.hoatv.ext.endpoint.dtos;


import com.hoatv.ext.endpoint.services.TaskExecutionType;
import com.hoatv.springboot.common.validation.ValueOfEnum;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InputVO {
    @NotEmpty(message = "Application cannot be NULL/empty")
    private String application;

    @NotEmpty(message = "Task name cannot be NULL/empty")
    private String taskName;

    @Min(value = 1, message = "Number of running times cannot be 0")
    private int noAttemptTimes;

    @Min(value = 1, message = "Number of threads cannot be 0")
    private int noParallelThread;

    @NotEmpty(message = "Executor cannot be NULL/empty")
    @ValueOfEnum(TaskExecutionType.class)
    private String executorServiceType = TaskExecutionType.EXECUTE_WITH_EXECUTOR_SERVICE.name();

    private String columnMetadata;

    @Valid
    private RequestInfoVO requestInfo;

    @Valid
    private DataGeneratorInfoVO dataGeneratorInfo;
}
