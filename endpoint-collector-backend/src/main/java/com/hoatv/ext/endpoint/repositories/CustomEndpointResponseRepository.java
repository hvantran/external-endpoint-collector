package com.hoatv.ext.endpoint.repositories;

import com.hoatv.ext.endpoint.models.EndpointResponse;
import com.hoatv.ext.endpoint.models.EndpointSetting;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class CustomEndpointResponseRepository {

    private final EntityManager entityManager;

    public CustomEndpointResponseRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }
    
    public String findMaxValueByColumn(String columnName, Long endpointSettingId) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object> query = cb.createQuery(Object.class);

        Root<EndpointResponse> root = query.from(EndpointResponse.class);
        Join<EndpointResponse, EndpointSetting> relatedEntityRoot = root.join("endpointSetting");
        Predicate predicate = cb.equal(relatedEntityRoot.get("id"), endpointSettingId);
        query.select(cb.max(root.get(columnName))).where(predicate);
        return (String) entityManager.createQuery(query).getSingleResult();
    }

}
