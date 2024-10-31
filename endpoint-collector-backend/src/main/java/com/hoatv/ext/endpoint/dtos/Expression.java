package com.hoatv.ext.endpoint.dtos;


import com.hoatv.fwk.common.exceptions.AppException;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

@Getter
@AllArgsConstructor
public enum Expression {
    EXACT("$eq"),
    CONTAINS("$contains"),
    STARTS_WITH("$startsWith"),
    ENDS_WITH("$endsWith"),
    GREATER_THAN("$gt"),
    GREATER_THAN_OR_EQUALS("$gte"),
    LESS_THAN("$lt"),
    LESS_THAN_OR_EQUALS("$lte"),
    NOT_NULL("$notNull") {
        @Override
        public void validate(String searchExpression) {
            super.validate(searchExpression);
            String[] expressionParts = searchExpression.split(":");
            if (expressionParts.length != 2) {
                throw new AppException("Invalid search expression. Syntax must be <column>:$notNull");
            }
        }
    },
    IS_NULL("$null") {
        @Override
        public void validate(String searchExpression) {
            String[] expressionParts = searchExpression.split(":");
            if (expressionParts.length != 2) {
                throw new AppException("Invalid search expression. Syntax must be <column>:$null");
            }
        }
    };

    private final String syntax;

    public void validate(String searchExpression) {
        String[] expressionParts = searchExpression.split(":");
        if (expressionParts.length != 3) {
            throw new AppException("Invalid search expression. Syntax must be <column>:<expression>:<text>");
        }
    }

    public static Expression of(String expressionName) {
        return Arrays.stream(Expression.values()).filter(p -> p.getSyntax().equals(expressionName))
                .findFirst()
                .orElseThrow(() -> new AppException("Unsupported expression: " + expressionName));
    }
}