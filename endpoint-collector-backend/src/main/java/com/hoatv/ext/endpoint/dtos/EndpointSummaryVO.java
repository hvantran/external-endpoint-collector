package com.hoatv.ext.endpoint.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(value = JsonInclude.Include.NON_NULL)
public class EndpointSummaryVO {

    private Long endpointId;

    private InputVO input;

    private FilterVO filter;

    private OutputVO output;

    private String elapsedTime;

    private String createdAt;
}

