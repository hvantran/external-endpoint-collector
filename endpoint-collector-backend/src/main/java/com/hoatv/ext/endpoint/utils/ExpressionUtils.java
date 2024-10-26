package com.hoatv.ext.endpoint.utils;

import com.hoatv.ext.endpoint.dtos.TableSearchVO;
import com.hoatv.fwk.common.exceptions.AppException;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;

import java.beans.PropertyDescriptor;
import java.lang.reflect.InvocationTargetException;

public class ExpressionUtils {
    private ExpressionUtils() {

    }
    
    public static <T> Example<T> getExample(TableSearchVO entry, T probe) throws InvocationTargetException, IllegalAccessException {
        String columnName = entry.getColumnName();
        PropertyDescriptor pd = BeanUtils.getPropertyDescriptor(probe.getClass(), columnName);
        if (pd == null || pd.getWriteMethod() == null) {
            throw new IllegalArgumentException("Unsupported column or no setter for: " + columnName);
        }

        pd.getWriteMethod().invoke(probe, convertToFieldType(pd.getPropertyType(), entry.getSearchText()));
        ExampleMatcher matcher = ExampleMatcher
                .matching()
                .withMatcher(columnName, matchExpression(entry.getExpression()));
        return Example.of(probe, matcher);
    }

    private static ExampleMatcher.GenericPropertyMatcher matchExpression(String expression) {
        return switch (expression) {
            case "exact" -> ExampleMatcher.GenericPropertyMatchers.exact();
            case "contains" -> ExampleMatcher.GenericPropertyMatchers.contains();
            case "startsWith" -> ExampleMatcher.GenericPropertyMatchers.startsWith();
            case "endsWith" -> ExampleMatcher.GenericPropertyMatchers.endsWith();
            default -> throw new AppException("Unsupported expression: " + expression);
        };
    }

    private static Object convertToFieldType(Class<?> type, String value) {
        if (type.equals(Integer.class) || type.equals(int.class)) {
            return Integer.parseInt(value);
        } else if (type.equals(Long.class) || type.equals(long.class)) {
            return Long.parseLong(value);
        } else if (type.equals(Double.class) || type.equals(double.class)) {
            return Double.parseDouble(value);
        } else if (type.equals(Boolean.class) || type.equals(boolean.class)) {
            return Boolean.parseBoolean(value);
        }
        return value;
    }
}
