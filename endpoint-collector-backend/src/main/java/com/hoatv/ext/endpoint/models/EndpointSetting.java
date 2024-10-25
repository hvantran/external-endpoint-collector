package com.hoatv.ext.endpoint.models;

import com.hoatv.ext.endpoint.dtos.*;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldNameConstants;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldNameConstants
public class EndpointSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column
    private String application;

    @Column
    private String taskName;

    @Column(nullable = false)
    private String extEndpoint;

    @Column(nullable = false)
    private String method;

    @Column(length = 2048)
    private String data;

    @Column(length = 2048)
    @Convert(converter = StringMapConverter.class)
    private Map<String, String> headers;

    @Column
    private Integer noAttemptTimes;

    @Column
    private Integer noParallelThread;

    @Column(length = 2048)
    private String columnMetadata;

    @Column
    private String generatorMethodName;

    @Column
    private Integer generatorSaltLength;

    @Column
    private String generatorSaltStartWith;

    @Column
    private String generatorStrategy;

    @Column
    private String successCriteria;

    @Column
    private String responseConsumerType;

    @Column
    private String executorServiceType;

    @Column
    private LocalDateTime createdAt;

    @ToString.Exclude
    @OneToOne(mappedBy = "endpointSetting", cascade = CascadeType.ALL)
    private EndpointExecutionResult executionResult;

    @ToString.Exclude
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "endpointSetting")
    private Set<EndpointResponse> resultSet = new HashSet<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    public EndpointSettingVO toEndpointSettingVO() {

        RequestInfoVO requestInfo = RequestInfoVO.builder()
                .data(data)
                .extEndpoint(extEndpoint)
                .method(method)
                .headers(headers)
                .build();
        DataGeneratorInfoVO dataGeneratorInfo = DataGeneratorInfoVO.builder()
                .generatorMethodName(generatorMethodName)
                .generatorSaltLength(generatorSaltLength)
                .generatorStrategy(generatorStrategy)
                .generatorSaltStartWith(generatorSaltStartWith)
                .build();
        InputVO input = InputVO.builder()
                .application(application)
                .taskName(taskName)
                .noAttemptTimes(noAttemptTimes)
                .noParallelThread(noParallelThread)
                .columnMetadata(columnMetadata)
                .dataGeneratorInfo(dataGeneratorInfo)
                .requestInfo(requestInfo)
                .executorServiceType(executorServiceType)
                .build();
        FilterVO filter = FilterVO.builder()
                .successCriteria(successCriteria)
                .build();
        OutputVO outputVO = OutputVO.builder()
                .responseConsumerType(responseConsumerType)
                .build();
        return EndpointSettingVO.builder()
                .endpointId(id)
                .input(input)
                .filter(filter)
                .output(outputVO)
                .build();
    }

    public static EndpointSetting fromEndpointConfigVO(EndpointSettingVO endpointSettingVO) {

        InputVO input = endpointSettingVO.getInput();
        RequestInfoVO requestInfo = input.getRequestInfo();
        DataGeneratorInfoVO dataGeneratorInfo = input.getDataGeneratorInfo();
        FilterVO filter = endpointSettingVO.getFilter();
        return EndpointSetting.builder()
                .application(input.getApplication())
                .taskName(input.getTaskName())
                .extEndpoint(requestInfo.getExtEndpoint())
                .method(requestInfo.getMethod())
                .data(requestInfo.getData())
                .noAttemptTimes(input.getNoAttemptTimes())
                .noParallelThread(input.getNoParallelThread())
                .columnMetadata(input.getColumnMetadata())
                .generatorStrategy(dataGeneratorInfo.getGeneratorStrategy())
                .generatorMethodName(dataGeneratorInfo.getGeneratorMethodName())
                .generatorSaltLength(dataGeneratorInfo.getGeneratorSaltLength())
                .headers(requestInfo.getHeaders())
                .generatorSaltStartWith(dataGeneratorInfo.getGeneratorSaltStartWith())
                .successCriteria(filter.getSuccessCriteria())
                .executorServiceType(input.getExecutorServiceType())
                .responseConsumerType(endpointSettingVO.getOutput().getResponseConsumerType())
                .build();
    }
}

