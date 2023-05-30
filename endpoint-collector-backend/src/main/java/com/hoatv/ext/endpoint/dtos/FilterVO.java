package com.hoatv.ext.endpoint.dtos;


import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterVO {
    @NotEmpty(message = "Application cannot be NULL/empty")
    private String successCriteria;
}