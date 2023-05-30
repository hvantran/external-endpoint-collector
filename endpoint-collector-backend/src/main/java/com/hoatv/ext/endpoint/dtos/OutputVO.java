package com.hoatv.ext.endpoint.dtos;


import com.hoatv.ext.endpoint.api.ResponseConsumerType;
import com.hoatv.springboot.common.validation.ValueOfEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutputVO {

    @ValueOfEnum(ResponseConsumerType.class)
    private String responseConsumerType = ResponseConsumerType.CONSOLE.name();
}