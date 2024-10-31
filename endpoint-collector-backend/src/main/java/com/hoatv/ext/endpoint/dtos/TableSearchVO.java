package com.hoatv.ext.endpoint.dtos;

import com.hoatv.fwk.common.exceptions.AppException;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import org.apache.commons.lang3.StringUtils;

@Getter
@ToString
@AllArgsConstructor
public class TableSearchVO {

    private String columnName;

    private Expression expression;

    private String searchText;

    public static TableSearchVO parse(String searchExpression) {
        if (StringUtils.isEmpty(searchExpression)) {
            return null;
        }

        String[] expressionParts = searchExpression.split(":");
        if (expressionParts.length >= 2) {
            Expression expression = Expression.of(expressionParts[1]);
            expression.validate(searchExpression);
            String columnName = expressionParts[0];
            String searchValue = expressionParts.length == 2 ? "" : expressionParts[2];
            return new TableSearchVO(columnName, expression, searchValue);
        }
        throw new AppException("Unsupported expression " + searchExpression + ". At least expression is <column>:<expression>");
    }

}
