package com.hoatv.ext.endpoint.controllers;

import com.hoatv.ext.endpoint.dtos.EndpointResponseVO;
import com.hoatv.ext.endpoint.dtos.EndpointSettingVO;
import com.hoatv.ext.endpoint.services.ExtRestDataService;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping(value = "/rest-data", produces = MediaType.APPLICATION_JSON_VALUE)
public class ExtRestDataController {

    private final ExtRestDataService extRestDataService;

    public ExtRestDataController(ExtRestDataService extRestDataService) {
        this.extRestDataService = extRestDataService;
    }

    @PostMapping(value = "/endpoints", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addExtEndpoint(@Valid @RequestBody EndpointSettingVO endpointSettingVO) {
        extRestDataService.addExtEndpoint(endpointSettingVO);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/endpoints", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllExtEndpoints(@RequestParam(required = false) String application,
                                                @RequestParam int pageIndex,
                                                @RequestParam int pageSize) {
        Page<EndpointSettingVO> allExtEndpoints =
                extRestDataService.getAllExtEndpoints(application, PageRequest.of(pageIndex, pageSize));
        return ResponseEntity.ok(allExtEndpoints);
    }

    @GetMapping(value = "/endpoints/{application}/responses", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getEndpointResponses(@PathVariable("application") String application,
                                                  @RequestParam int pageIndex,
                                                  @RequestParam int pageSize) {
        Page<EndpointResponseVO> endpointResponses =
                extRestDataService.getEndpointResponses(application, PageRequest.of(pageIndex, pageSize));
        return ResponseEntity.ok(endpointResponses);
    }
}
