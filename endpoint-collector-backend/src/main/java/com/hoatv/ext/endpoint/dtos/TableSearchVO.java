package com.hoatv.ext.endpoint.dtos;

import com.hoatv.ext.endpoint.models.EndpointResponse;
import com.hoatv.fwk.common.exceptions.AppException;
import com.hoatv.fwk.common.services.CheckedConsumer;
import com.hoatv.fwk.common.services.CheckedSupplier;
import lombok.*;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Getter
@ToString
@AllArgsConstructor
public class TableSearchVO {

    private String columnName;

    private String searchText;

    public static TableSearchVO parse(String searchExpression) {
        if (StringUtils.isEmpty(searchExpression)) {
            return null;
        }

        Pattern pattern = Pattern.compile("(.*):(.*)");
        Matcher matcher = pattern.matcher(searchExpression);
        if (matcher.matches()) {
            String columnName = matcher.group(1).trim();
            String searchText = matcher.group(2).trim();
            return new TableSearchVO(columnName, searchText);
        }
        throw new AppException("Invalid search expression. Syntax must be <column>:<text>");
    }
    
    public static <T> Example<T> getExample(TableSearchVO entry, T endpointResponse) {
        String columnName = entry.getColumnName();
        Stream<Field> fieldStream = Arrays.stream(endpointResponse.getClass().getDeclaredFields());
        String actualColumnName = fieldStream
                .map(Field::getName)
                .filter(columnName::equals)
                .findFirst()
                .orElseThrow(() -> new AppException("Column " + columnName + " is not found"));

        CheckedSupplier<Method> setColumnMethod = () -> endpointResponse
                .getClass()
                .getMethod("set" + StringUtils.capitalize(actualColumnName), String.class);
        
        CheckedConsumer<Method> invoke = method -> setColumnMethod.get()
                .invoke(endpointResponse, entry.getSearchText());
        invoke.accept(setColumnMethod.get());
        
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnoreNullValues()
                .withMatcher(actualColumnName, match -> match.contains().ignoreCase());
        return Example.of(endpointResponse, matcher);
    }
}
