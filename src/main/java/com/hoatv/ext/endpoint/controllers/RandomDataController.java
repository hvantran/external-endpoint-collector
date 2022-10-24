package com.hoatv.ext.endpoint.controllers;

import com.hoatv.ext.endpoint.utils.SaltGeneratorUtils;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/random", produces = MediaType.APPLICATION_JSON_VALUE)
public class RandomDataController {

    @GetMapping(value = "/nums")
    public String getAllExtEndpoints(@RequestParam Integer length) {
        return SaltGeneratorUtils.getSaltNums(length);
    }

    @GetMapping(value = "/chars")
    public String getEndpointResponses(@RequestParam Integer length) {
        return SaltGeneratorUtils.getSaltString(length);
    }
}
