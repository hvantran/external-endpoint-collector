package com.hoatv.ext.endpoint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableAutoConfiguration
@ComponentScan({"com.hoatv.ext.endpoint", "com.hoatv.springboot.common"})
public class ExternalEndpointApplication {

    public static void main(String[] args) {

        SpringApplication.run(ExternalEndpointApplication.class);
    }


    @Bean
    public RestTemplate restTemplate() {

        return new RestTemplate();
    }

}
