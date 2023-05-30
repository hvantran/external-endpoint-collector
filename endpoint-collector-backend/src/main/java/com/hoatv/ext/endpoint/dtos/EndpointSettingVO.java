package com.hoatv.ext.endpoint.dtos;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EndpointSettingVO {

    private Long endpointId;

    @Valid
    private InputVO input;

    @Valid
    private FilterVO filter;

    @Valid
    private OutputVO output;

}

