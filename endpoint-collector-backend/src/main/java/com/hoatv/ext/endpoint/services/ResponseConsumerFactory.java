package com.hoatv.ext.endpoint.services;

import com.hoatv.ext.endpoint.api.ResponseConsumer;
import com.hoatv.ext.endpoint.api.ResponseConsumerType;
import com.hoatv.ext.endpoint.repositories.EndpointResponseRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.Map;

@Service
public class ResponseConsumerFactory {

    private final Map<ResponseConsumerType, ResponseConsumer> consumerRegistry = new EnumMap<>(ResponseConsumerType.class);

    private final EndpointResponseRepository endpointResponseRepository;

    public ResponseConsumerFactory(EndpointResponseRepository endpointResponseRepository) {

        this.endpointResponseRepository = endpointResponseRepository;
    }

    public void registerResponseConsumer(ResponseConsumer responseConsumer) {

        consumerRegistry.put(responseConsumer.getResponseConsumerType(), responseConsumer);
    }

    public ResponseConsumer getResponseConsumer(ResponseConsumerType responseConsumerType) {

        return consumerRegistry.get(responseConsumerType);
    }

    @PostConstruct
    public void init() {

        registerResponseConsumer(new ConsoleResponseConsumer());
        registerResponseConsumer(DBResponseConsumer.builder()
                .endpointResponseRepository(endpointResponseRepository).build());
    }
}
