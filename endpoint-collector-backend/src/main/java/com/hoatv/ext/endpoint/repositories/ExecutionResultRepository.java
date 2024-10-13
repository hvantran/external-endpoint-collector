package com.hoatv.ext.endpoint.repositories;

import com.hoatv.ext.endpoint.models.EndpointExecutionResult;
import com.hoatv.ext.endpoint.models.EndpointSetting;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public interface ExecutionResultRepository extends JpaRepository<EndpointExecutionResult, Long> {

    void deleteByEndpointSetting(EndpointSetting endpointSetting);

    EndpointExecutionResult findByEndpointSetting(EndpointSetting endpointSetting);
    
    @EntityGraph(attributePaths = "endpointSetting")
    List<EndpointExecutionResult> findByPercentCompleteLessThan(int percent);
}
