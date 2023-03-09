package com.hoatv.ext.endpoint.controllers;

import com.hoatv.ext.endpoint.config.KeycloakLogoutHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
public class SampleRestController {
    private static final Logger logger = LoggerFactory.getLogger(SampleRestController.class);

    @GetMapping(path = "/")
    public String index() {
        return "external";
    }

    @GetMapping(path = "/home")
    public String customers(Principal principal) {
        logger.info("User {} logged into application", principal.getName());
        return String.format("Hello %s customers", principal.getName());
    }
}
