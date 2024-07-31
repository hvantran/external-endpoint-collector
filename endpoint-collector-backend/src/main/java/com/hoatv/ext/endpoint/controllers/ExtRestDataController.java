package com.hoatv.ext.endpoint.controllers;

import com.hoatv.ext.endpoint.dtos.EndpointResponseVO;
import com.hoatv.ext.endpoint.dtos.EndpointSettingVO;
import com.hoatv.ext.endpoint.dtos.EndpointSummaryVO;
import com.hoatv.ext.endpoint.models.EndpointResponse;
import com.hoatv.ext.endpoint.models.EndpointSetting;
import com.hoatv.ext.endpoint.services.ExtRestDataService;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/endpoints", produces = MediaType.APPLICATION_JSON_VALUE)
public class ExtRestDataController {

    private final ExtRestDataService extRestDataService;

    public ExtRestDataController (ExtRestDataService extRestDataService) {
        this.extRestDataService = extRestDataService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> addExtEndpoint (@Valid @RequestBody EndpointSettingVO endpointSettingVO) {

        Long extEndpoint = extRestDataService.addExtEndpoint(endpointSettingVO);
        return ResponseEntity.ok(String.format("{\"endpointId\": %s}", extEndpoint));
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getAllExtEndpoints (
        @RequestParam(required = false, name = "application") String application,
        @RequestParam(name = "pageIndex") int pageIndex,
        @RequestParam(name = "pageSize") int pageSize) {

        Sort defaultSorting = Sort.by(
                Sort.Order.desc(EndpointSetting.Fields.createdAt), 
                Sort.Order.asc(EndpointSetting.Fields.application)
        );
        Page<EndpointSummaryVO> allExtEndpoints =
            extRestDataService.getAllExtEndpoints(application, PageRequest.of(pageIndex, pageSize, defaultSorting));
        return ResponseEntity.ok(allExtEndpoints);
    }

    @DeleteMapping(value = "/{endpointId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getEndpointResponses (@PathVariable("endpointId") Long endpointId) {

        boolean isDeleted = extRestDataService.deleteEndpoint(endpointId);
        return ResponseEntity.ok(String.format("{\"message\": %s}", isDeleted));
    }

    @GetMapping(value = "/{endpointId}/responses", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getEndpointResponses (@PathVariable("endpointId") Long endpointId,
                                                        @RequestParam(name = "pageIndex") int pageIndex,
                                                        @RequestParam(name = "pageSize") int pageSize) {

        Sort defaultSorting = Sort.by(Sort.Order.asc(EndpointResponse.Fields.column1));
        Page<EndpointResponseVO> endpointResponses =
            extRestDataService.getEndpointResponses(endpointId, PageRequest.of(pageIndex, pageSize, defaultSorting));
        return ResponseEntity.ok(endpointResponses);
    }

    @GetMapping(value = "/{application}/responses-by-app-name", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getEndpointResponses (@PathVariable("application") String application,
                                                        @RequestParam(name = "pageIndex") int pageIndex,
                                                        @RequestParam(name = "pageSize") int pageSize) {

        Sort defaultSorting = Sort.by(Sort.Order.asc(EndpointResponse.Fields.column1));
        Page<EndpointResponseVO> endpointResponses =
            extRestDataService.getEndpointResponses(application, PageRequest.of(pageIndex, pageSize, defaultSorting));
        return ResponseEntity.ok(endpointResponses);
    }
}
