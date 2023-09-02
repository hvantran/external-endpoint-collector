package com.hoatv.ext.endpoint.models;

import com.hoatv.ext.endpoint.dtos.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    @Lob
    @Column
    private String data;

    @Column
    private Integer noAttemptTimes;

    @Column
    private Integer noParallelThread;

    @Lob
    @Column(nullable = false)
    private String columnMetadata;

    @Column
    private String generatorMethodName;

    @Column
    private Integer generatorSaltLength;

    @Column
    private String generatorSaltStartWith;

    @Column
    private String successCriteria;

    @Column
    private String responseConsumerType;

    @Column
    private String executorServiceType;

    @Column
    private LocalDateTime createdAt;

    @OneToOne
    @ToString.Exclude
    private EndpointExecutionResult executionResult;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "endpointSetting")
    @ToString.Exclude
    private Set<EndpointResponse> resultSet = new HashSet<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    public EndpointSettingVO toEndpointConfigVO() {

        RequestInfoVO requestInfo = RequestInfoVO.builder()
                .data(data)
                .extEndpoint(extEndpoint)
                .method(method)
                .build();
        DataGeneratorInfoVO dataGeneratorInfo = DataGeneratorInfoVO.builder()
                .generatorMethodName(generatorMethodName)
                .generatorSaltLength(generatorSaltLength)
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

    public EndpointSummaryVO.EndpointSummaryVOBuilder toEndpointSummaryVO() {

        RequestInfoVO requestInfo = RequestInfoVO.builder()
                .data(data)
                .extEndpoint(extEndpoint)
                .method(method)
                .build();
        DataGeneratorInfoVO dataGeneratorInfo = DataGeneratorInfoVO.builder()
                .generatorMethodName(generatorMethodName)
                .generatorSaltLength(generatorSaltLength)
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
        return EndpointSummaryVO.builder()
                .endpointId(id)
                .input(input)
                .output(outputVO)
                .createdAt(Objects.isNull(createdAt) ? "" : createdAt.format(DateTimeFormatter.ISO_DATE_TIME))
                .filter(filter);
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
                .generatorMethodName(dataGeneratorInfo.getGeneratorMethodName())
                .generatorSaltLength(dataGeneratorInfo.getGeneratorSaltLength())
                .generatorSaltStartWith(dataGeneratorInfo.getGeneratorSaltStartWith())
                .successCriteria(filter.getSuccessCriteria())
                .executorServiceType(input.getExecutorServiceType())
                .responseConsumerType(endpointSettingVO.getOutput().getResponseConsumerType())
                .build();
    }
}

