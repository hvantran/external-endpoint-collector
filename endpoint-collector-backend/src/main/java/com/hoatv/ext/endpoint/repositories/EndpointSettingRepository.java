package com.hoatv.ext.endpoint.repositories;

import com.hoatv.ext.endpoint.models.EndpointExecutionResult;
import com.hoatv.ext.endpoint.models.EndpointSetting;
import com.hoatv.ext.endpoint.models.ExecutionState;
import jakarta.transaction.Transactional;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
@Transactional
public interface EndpointSettingRepository extends JpaRepository<EndpointSetting, Long> {

    Page<EndpointSetting> findEndpointConfigsByApplication(String application, Pageable pageable);

    @NonNull
    @Query(
            value = """
                        SELECT 
                        es AS endpointSetting, 
                        es.extEndpoint AS targetURL,
                        es.taskName AS taskName,
                        es.application AS application,
                        eer.state AS state,
                        COALESCE(eer.percentComplete, 0) AS percentCompleted, 
                        COALESCE(eer.numberOfTasks, 0) AS numberOfCompletedTasks,
                        eer.elapsedTime AS elapsedTime,
                        COALESCE(COUNT(er.id), 0) AS numberOfResponses
                        FROM 
                            EndpointSetting AS es
                        LEFT JOIN
                            es.executionResult AS eer
                        LEFT JOIN 
                            es.resultSet AS er
                        GROUP BY 
                            es, es.extEndpoint, 
                            es.taskName, 
                            es.application, 
                            eer.state, 
                            eer.percentComplete, 
                            eer.elapsedTime, 
                            eer.numberOfTasks
                    """,
            countQuery = "SELECT COUNT(DISTINCT es.id) FROM EndpointSetting es"
    )
    Page<EndpointSettingOverview> findEndpointSettingOverview(@NonNull Pageable pageable);

    interface EndpointSettingOverview {
        EndpointSetting getEndpointSetting();

        String getApplication();

        String getTaskName();

        String getTargetURL();

        String getElapsedTime();

        ExecutionState getState();

        Integer getPercentCompleted();

        Integer getNumberOfCompletedTasks();

        Integer getNumberOfResponses();
    }

}
