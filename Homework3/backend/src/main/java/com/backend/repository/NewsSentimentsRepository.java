package com.backend.repository;

import com.backend.entities.NewsSentiments;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NewsSentimentsRepository extends JpaRepository<NewsSentiments, Long> {
    List<NewsSentiments> findByIssuer(String issuer);
}
