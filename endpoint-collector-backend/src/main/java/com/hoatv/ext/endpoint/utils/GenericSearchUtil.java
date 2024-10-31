package com.hoatv.ext.endpoint.utils;

import com.hoatv.ext.endpoint.dtos.Expression;
import com.hoatv.ext.endpoint.dtos.TableSearchVO;
import com.hoatv.fwk.common.exceptions.AppException;
import com.hoatv.fwk.common.services.CheckedConsumer;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.jpa.convert.QueryByExamplePredicateBuilder;
import org.springframework.data.jpa.domain.Specification;

import java.beans.PropertyDescriptor;
import java.util.ArrayList;
import java.util.List;

public class GenericSearchUtil {
    private GenericSearchUtil() {

    }
    

    public static <T> Specification<T> getSpecification(TableSearchVO entry, T probe) {
        String columnName = entry.getColumnName();
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            Expression expression = entry.getExpression();
            
            PropertyDescriptor descriptor = BeanUtils.getPropertyDescriptor(probe.getClass(), columnName);
            if (descriptor == null || descriptor.getWriteMethod() == null) {
                throw new AppException("Unsupported column or no setter for: " + columnName);
            }
            Object convertedValue = convertToFieldType(descriptor.getPropertyType(), entry.getSearchText());
            switch (expression) {
                case EXACT, STARTS_WITH, ENDS_WITH, CONTAINS: {
                    CheckedConsumer<T> safeInvoke = instance -> descriptor.getWriteMethod().invoke(instance, convertedValue);
                    safeInvoke.accept(probe);
                    ExampleMatcher matcher = ExampleMatcher.matching().withMatcher(columnName, matchExpression(expression));
                    Example<T> example = Example.of(probe, matcher);
                    predicates.add(QueryByExamplePredicateBuilder.getPredicate(root, criteriaBuilder, example));
                    break;
                }
                case GREATER_THAN: {
                    predicates.add(criteriaBuilder.greaterThan(root.get(columnName), (Comparable) convertedValue));
                    break;
                }
                case GREATER_THAN_OR_EQUALS: {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(columnName), (Comparable) convertedValue));
                    break;
                }
                case LESS_THAN:
                    predicates.add(criteriaBuilder.lessThan(root.get(columnName), (Comparable) convertedValue));
                    break;
                case LESS_THAN_OR_EQUALS:
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(columnName), (Comparable) convertedValue));
                    break;
                case NOT_NULL:
                    predicates.add(criteriaBuilder.isNotNull(root.get(columnName)));
                    break;
                case IS_NULL:
                    predicates.add(criteriaBuilder.isNull(root.get(columnName)));
                    break;
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static ExampleMatcher.GenericPropertyMatcher matchExpression(Expression expression) {
        return switch (expression) {
            case EXACT -> ExampleMatcher.GenericPropertyMatchers.exact();
            case CONTAINS -> ExampleMatcher.GenericPropertyMatchers.contains();
            case STARTS_WITH -> ExampleMatcher.GenericPropertyMatchers.startsWith();
            case ENDS_WITH -> ExampleMatcher.GenericPropertyMatchers.endsWith();
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
