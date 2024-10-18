package com.hoatv.ext.endpoint.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hoatv.ext.endpoint.models.EndpointExecutionResult;
import com.hoatv.ext.endpoint.models.ExecutionState;
import lombok.*;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(value = JsonInclude.Include.NON_NULL)
public class EndpointSettingOverviewVO {

    private Long endpointId;

    private String application;

    private String taskName;

    private String targetURL;

    private String elapsedTime;

    private String createdAt;

    private Integer numberOfCompletedTasks;

    private Integer numberOfResponses;

    private Integer percentCompleted;
    
    private ExecutionState state;
}

