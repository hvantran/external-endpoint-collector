package com.hoatv.ext.endpoint.controllers;

import com.hoatv.ext.endpoint.dtos.*;
import com.hoatv.ext.endpoint.models.EndpointResponse;
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

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getEndpoints(
            @RequestParam(name = "pageIndex") int pageIndex,
            @RequestParam(name = "pageSize") int pageSize,
            @RequestParam(name = "orderBy", defaultValue = "-createdAt") String orderBy) {
        Sort.Direction direction = orderBy.startsWith("-") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortByProperty = orderBy.replace("-", "");
        Sort defaultSorting = Sort.by(new Sort.Order(direction, sortByProperty));
        PageRequest pageable = PageRequest.of(pageIndex, pageSize, defaultSorting);
        Page<EndpointSettingOverviewVO> allExtEndpoints =
                externalRestDataService.getAllExtEndpoints(pageable);
        return ResponseEntity.ok(allExtEndpoints);
    }

    @GetMapping(value = "/{endpointId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getEndpointSetting(@PathVariable("endpointId") Long endpointId) {
        EndpointSettingVO extEndpoint = externalRestDataService.getEndpointSetting(endpointId);
        return ResponseEntity.ok(extEndpoint);
    }

    @PutMapping(value = "/{endpointId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> updateEndpointSetting(
            @PathVariable("endpointId") Long endpointId,
            @Valid @RequestBody PatchEndpointSettingVO patchEndpointSettingVO) {
        externalRestDataService.updateEndpointSetting(endpointId, patchEndpointSettingVO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping(value = "/{endpointId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> deleteEndpointSetting(
            @PathVariable("endpointId") Long endpointId) {
        boolean isDeleted = externalRestDataService.deleteEndpoint(endpointId);
        return ResponseEntity.ok(String.format("{\"message\": %s}", isDeleted));
    }

    @GetMapping(value = "/responses", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getEndpointResponses(
            @RequestParam(name = "search", defaultValue = "") String search,
            @RequestParam(name = "pageIndex") int pageIndex,
            @RequestParam(name = "pageSize") int pageSize,
            @RequestParam(name = "orderBy", defaultValue = "-column1") String orderBy) {
        Sort.Direction direction = orderBy.startsWith("-") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortByProperty = orderBy.replace("-", "");
        Sort defaultSorting = Sort.by(new Sort.Order(direction, sortByProperty));
        TableSearchVO tableSearchVO = TableSearchVO.parse(search);
        Page<EndpointResponseVO> allExtEndpoints =
                externalRestDataService.getEndpointResponses(tableSearchVO, PageRequest.of(pageIndex, pageSize, defaultSorting));
        return ResponseEntity.ok(allExtEndpoints);
    }

    @GetMapping(value = "/{endpointId}/responses", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> getEndpointResponses(
            @PathVariable("endpointId") Long endpointId,
            @RequestParam(name = "pageIndex") int pageIndex,
            @RequestParam(name = "pageSize") int pageSize,
            @RequestParam(name = "orderBy", defaultValue = "column1") String orderBy) {
        Sort.Direction direction = orderBy.startsWith("-") ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortByProperty = orderBy.replace("-", "");
        Sort defaultSorting = Sort.by(new Sort.Order(direction, sortByProperty));
        PageRequest pageable = PageRequest.of(pageIndex, pageSize, defaultSorting);
        Page<EndpointResponseVO> endpointResponses =
                externalRestDataService.getEndpointResponses(endpointId, pageable);
        return ResponseEntity.ok(endpointResponses);
    }
}
