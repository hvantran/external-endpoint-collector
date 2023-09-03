package com.hoatv.ext.endpoint.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {

        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {

                registry.addMapping("/**")
                        .allowedMethods("*")
                        .allowedOrigins("http://localhost:3001", "http://extendpointui.local:6086", "http://localhost:6086", "http://localhost:8070")
                        .allowedHeaders("*");
            }
        };
    }
}
