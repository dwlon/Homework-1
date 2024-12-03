package com.stockmarketapp.repository;

import com.stockmarketapp.entities.Index;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IndexRepository extends JpaRepository<Index, Long> {
}

