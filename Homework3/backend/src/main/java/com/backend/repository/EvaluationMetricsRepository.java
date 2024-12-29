// EvaluationMetricsRepository.java
package com.backend.repository;

import com.backend.entities.EvaluationMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationMetricsRepository extends JpaRepository<EvaluationMetrics, String> {
    // issuer is the PK, so we only need a findById or findByIssuer
    EvaluationMetrics findByIssuer(@Param("issuer") String issuer);
    // Fetch distinct issuers
    @Query("SELECT DISTINCT i.issuer FROM EvaluationMetrics i")
    List<String> findDistinctIssuers();
}
