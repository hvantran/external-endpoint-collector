package com.hoatv.ext.endpoint.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.FieldNameConstants;
import org.apache.commons.lang3.time.DurationFormatUtils;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Getter
@Setter
@ToString
@FieldNameConstants
@NoArgsConstructor
public class EndpointExecutionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ToString.Exclude
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "endpointSettingId", referencedColumnName = "id")
    private EndpointSetting endpointSetting;

    @Column
    private LocalDateTime startedAt;

    @Column
    @Enumerated(EnumType.STRING)
    private ExecutionState state;

    @Column
    private LocalDateTime endedAt;

    @Column
    private Integer numberOfTasks;

    @Column
    private Integer numberOfCompletedTasks;

    @Column
    private Integer percentComplete;

    @Column
    private String elapsedTime;

    @PrePersist
    public void prePersist() {
        state = ExecutionState.ACTIVE;
        percentComplete = 0;
        numberOfCompletedTasks = 0;
        startedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        long elapsedTimeMillis = ChronoUnit.MILLIS.between(startedAt, LocalDateTime.now());
        elapsedTime = DurationFormatUtils.formatDuration(elapsedTimeMillis, "HH:mm:ss.S");
        if (percentComplete == 100) {
            endedAt = LocalDateTime.now();
            state = ExecutionState.END;
        }
    }

}

