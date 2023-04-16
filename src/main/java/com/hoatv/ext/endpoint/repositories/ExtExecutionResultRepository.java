package com.hoatv.ext.endpoint.repositories;

import com.hoatv.ext.endpoint.models.EndpointExecutionResult;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
@Transactional
public interface ExtExecutionResultRepository extends JpaRepository<EndpointExecutionResult, Long> {
}
