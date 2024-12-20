package com.backend.repository;

import com.backend.entities.Index;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IndexRepository extends JpaRepository<Index, Long> {
    @Query("SELECT i FROM Index i WHERE i.issuer = :issuer AND i.date BETWEEN :startDate AND :endDate ORDER BY i.date ASC")
    List<Index> findByIssuerAndDateBetween(
            @Param("issuer") String issuer,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    // Fetch the latest seven records for each issuer
    // Note: SQLite doesn't support window functions like ROW_NUMBER(), so we'll handle this in the service layer
    List<Index> findByIssuerOrderByDateDesc(String issuer);

    // Fetch distinct issuers
    @Query("SELECT DISTINCT i.issuer FROM Index i")
    List<String> findDistinctIssuers();
}

