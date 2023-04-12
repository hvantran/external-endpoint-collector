package com.hoatv.ext.endpoint.repositories;

import com.hoatv.ext.endpoint.models.EndpointSetting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import java.util.List;

@Repository
@Transactional
public interface ExtEndpointSettingRepository extends JpaRepository<EndpointSetting, Long> {

    Page<EndpointSetting> findEndpointConfigsByApplication(String application, Pageable pageable);
}
