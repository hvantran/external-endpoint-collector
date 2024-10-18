package com.hoatv.ext.endpoint.dtos;

import com.hoatv.ext.endpoint.models.EndpointExecutionResult;
import com.hoatv.ext.endpoint.models.ExecutionState;
import lombok.*;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatchEndpointSettingVO {

    private ExecutionState state;

}

