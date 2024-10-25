package com.hoatv.ext.endpoint.models;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class StringMapConverter implements AttributeConverter<Map<String, Object>, String> {

    private static final Logger LOGGER = LoggerFactory.getLogger(StringMapConverter.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, Object> customerInfo) {
        if (MapUtils.isEmpty(customerInfo)) {
            return "{}";
        }

        try {
            return objectMapper.writeValueAsString(customerInfo);
        } catch (JsonProcessingException e) {
            LOGGER.error("JSON writing error", e);
            return "{}";
        }
    }

    @Override
    public Map<String, Object> convertToEntityAttribute(String inputJSON) {
        if (StringUtils.isEmpty(inputJSON)) {
            return new HashMap<>();
        }

        try {
            return objectMapper.readValue(inputJSON, new TypeReference<HashMap<String, Object>>() {});
        } catch (IOException e) {
            LOGGER.error("JSON reading error", e);
            return new HashMap<>();
        }
    }
}
