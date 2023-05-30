package com.hoatv.ext.endpoint.dtos;


import com.hoatv.ext.endpoint.utils.SaltGeneratorUtils;
import com.hoatv.springboot.common.validation.ValueOfEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataGeneratorInfoVO {

    private int generatorSaltLength;

    private String generatorMethodName;

    private String generatorSaltStartWith;

    @ValueOfEnum(SaltGeneratorUtils.GeneratorType.class)
    private String generatorStrategy = SaltGeneratorUtils.GeneratorType.NONE.name();
}