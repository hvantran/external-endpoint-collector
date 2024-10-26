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

    private String expression;

    private String searchText;

    public static TableSearchVO parse(String searchExpression) {
        if (StringUtils.isEmpty(searchExpression)) {
            return null;
        }

        String[] expressionParts = searchExpression.split(":");
        if (expressionParts.length != 3) {
            throw new AppException("Invalid search expression. Syntax must be <column>:<expression>:<text>");
        }

        String columnName = expressionParts[0];
        String expression = expressionParts[1];
        String value = expressionParts[2];
        return new TableSearchVO(columnName, expression, value);
    }

}
