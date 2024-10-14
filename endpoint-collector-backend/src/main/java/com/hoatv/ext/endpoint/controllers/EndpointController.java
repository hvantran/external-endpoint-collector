package com.hoatv.ext.endpoint.controllers;

import com.hoatv.ext.endpoint.dtos.EndpointResponseVO;
import com.hoatv.ext.endpoint.dtos.EndpointSettingVO;
import com.hoatv.ext.endpoint.dtos.EndpointSummaryVO;
import com.hoatv.ext.endpoint.models.EndpointResponse;
import com.hoatv.ext.endpoint.models.EndpointSetting;
import com.hoatv.ext.endpoint.services.ExternalRestDataService;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/endpoints", produces = MediaType.APPLICATION_JSON_VALUE)
public class EndpointController {

    private final ExternalRestDataService externalRestDataService;

    public EndpointController(ExternalRestDataService externalRestDataService) {
        this.externalRestDataService = externalRestDataService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> createEndpointSetting(
            @Valid @RequestBody EndpointSettingVO endpointSettingVO) {
        Long extEndpoint = externalRestDataService.createExternalEndpoint(endpointSettingVO);
        return ResponseEntity.ok(String.format("{\"endpointId\": %s}", extEndpoint));
    }

    @GetMapping(value = "/{endpointId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getEndpointSetting(@PathVariable("endpointId") Long endpointId) {
        EndpointSettingVO extEndpoint = externalRestDataService.getEndpointSetting(endpointId);
        return ResponseEntity.ok(extEndpoint);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getEndpoints(
            @RequestParam(required = false, name = "application") String application,
            @RequestParam(name = "pageIndex") int pageIndex,
            @RequestParam(name = "pageSize") int pageSize,
            @RequestParam(name = "orderBy", defaultValue = "application") String orderBy) {
        Sort.Direction direction = orderBy.startsWith("-") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortByProperty = orderBy.replace("-", "");
        Sort defaultSorting = Sort.by(new Sort.Order(direction, sortByProperty));
        Page<EndpointSummaryVO> allExtEndpoints =
                externalRestDataService.getAllExtEndpoints(application, PageRequest.of(pageIndex, pageSize, defaultSorting));
        return ResponseEntity.ok(allExtEndpoints);
    }

    @DeleteMapping(value = "/{endpointId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getEndpointResponses(
            @PathVariable("endpointId") Long endpointId) {
        boolean isDeleted = externalRestDataService.deleteEndpoint(endpointId);
        return ResponseEntity.ok(String.format("{\"message\": %s}", isDeleted));
    }

    @GetMapping(value = "/{endpointId}/responses", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getEndpointResponses(@PathVariable("endpointId") Long endpointId,
                                                       @RequestParam(name = "pageIndex") int pageIndex,
                                                       @RequestParam(name = "pageSize") int pageSize,
                                                       @RequestParam(name = "orderBy", defaultValue = "column1") String orderBy) {
        Sort.Direction direction = orderBy.startsWith("-") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortByProperty = orderBy.replace("-", "");
        Sort defaultSorting = Sort.by(new Sort.Order(direction, sortByProperty));
        Page<EndpointResponseVO> endpointResponses =
                externalRestDataService.getEndpointResponses(endpointId, PageRequest.of(pageIndex, pageSize, defaultSorting));
        return ResponseEntity.ok(endpointResponses);
    }

    @GetMapping(value = "/{application}/responses-by-app-name", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getEndpointResponses(
            @PathVariable("application") String application,
            @RequestParam(name = "pageIndex") int pageIndex,
            @RequestParam(name = "pageSize") int pageSize) {
        Sort defaultSorting = Sort.by(Sort.Order.asc(EndpointResponse.Fields.column1));
        Page<EndpointResponseVO> endpointResponses =
                externalRestDataService.getEndpointResponses(application, PageRequest.of(pageIndex, pageSize, defaultSorting));
        return ResponseEntity.ok(endpointResponses);
    }
}
