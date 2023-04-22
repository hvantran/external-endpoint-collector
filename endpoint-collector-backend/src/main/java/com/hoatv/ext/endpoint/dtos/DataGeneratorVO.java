package com.hoatv.ext.endpoint.dtos;

import com.hoatv.ext.endpoint.utils.SaltGeneratorUtils;
import com.hoatv.fwk.common.services.CheckedFunction;
import lombok.Builder;
import lombok.Getter;

import java.lang.reflect.Method;
import java.util.function.Predicate;

@Getter
@Builder
public class DataGeneratorVO {

    private final String generatorMethodName;
    private final Integer generatorSaltLength;
    private final String generatorSaltStartWith;

    private final SaltGeneratorUtils.GeneratorType generatorType;
    private final CheckedFunction<String, Method> generatorMethodFunc;
    private final Predicate<String> checkExistingFunc;
}
