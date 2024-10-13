package com.hoatv.ext.endpoint.repositories;

import com.hoatv.ext.endpoint.models.EndpointSetting;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
@Transactional
public interface EndpointSettingRepository extends JpaRepository<EndpointSetting, Long> {

    Page<EndpointSetting> findEndpointConfigsByApplication(String application, Pageable pageable);
}
