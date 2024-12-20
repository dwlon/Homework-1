// src/main/java/com/backend/repository/PrecomputedMetricsRepository.java
package com.backend.repository;

import com.backend.entities.PrecomputedMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrecomputedMetricsRepository extends JpaRepository<PrecomputedMetrics, Long> {
    Optional<PrecomputedMetrics> findByIssuerAndPeriod(String issuer, String period);
}
