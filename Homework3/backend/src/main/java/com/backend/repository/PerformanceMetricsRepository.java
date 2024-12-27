package com.backend.repository;

import com.backend.entities.PerformanceMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PerformanceMetricsRepository extends JpaRepository<PerformanceMetrics, Long> {
    Optional<PerformanceMetrics> findByIssuer(String issuer);
}
