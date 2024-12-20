package com.hoatv.ext.endpoint.repositories;

import com.hoatv.ext.endpoint.models.EndpointResponse;
import com.hoatv.ext.endpoint.models.EndpointSetting;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public interface EndpointResponseRepository extends JpaRepository<EndpointResponse, Long>, JpaSpecificationExecutor<EndpointResponse> {

    @Query(value = "SELECT MAX(:columnName) FROM endpoint_response WHERE endpoint_config_id=:endpointId", nativeQuery = true)
    String findLatestValue(@Param("columnName") String columnName, @Param("endpointId") Long endpointId);

    Page<EndpointResponse> findByEndpointSetting(EndpointSetting endpointSetting, Pageable pageable);

    Page<EndpointResponse> findByEndpointSettingIn(List<EndpointSetting> endpointConfigSettings, Pageable pageable);

    List<EndpointResponse> findEndpointResponsesByColumn3IsNotNullAndColumn10IsNull();

    boolean existsEndpointResponseByColumn1(String columnValue);

    boolean existsEndpointResponseByColumn2(String columnValue);

    boolean existsEndpointResponseByColumn3(String columnValue);

    boolean existsEndpointResponseByColumn4(String columnValue);

    boolean existsEndpointResponseByColumn5(String columnValue);

    boolean existsEndpointResponseByColumn6(String columnValue);

    boolean existsEndpointResponseByColumn7(String columnValue);

    boolean existsEndpointResponseByColumn8(String columnValue);

    boolean existsEndpointResponseByColumn9(String columnValue);

    boolean existsEndpointResponseByColumn10(String columnValue);

}
