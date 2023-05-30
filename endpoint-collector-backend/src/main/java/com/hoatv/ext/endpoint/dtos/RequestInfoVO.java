package com.hoatv.ext.endpoint.dtos;


import com.hoatv.fwk.common.services.HttpClientService;
import com.hoatv.springboot.common.validation.ValueOfEnum;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestInfoVO {

    @NotEmpty(message = "Endpoint cannot be NULL/empty")
    private String extEndpoint;

    @NotNull(message = "Method cannot be NULL")
    @ValueOfEnum(HttpClientService.HttpMethod.class)
    private String method;

    private String data;

    private Map<String, String> headers;
}