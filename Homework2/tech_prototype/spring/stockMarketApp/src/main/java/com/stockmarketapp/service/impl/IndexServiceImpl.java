package com.stockmarketapp.service.impl;

import com.stockmarketapp.entities.Index;
import com.stockmarketapp.repository.IndexRepository;
import com.stockmarketapp.service.IndexService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IndexServiceImpl implements IndexService {
    private final IndexRepository indexRepository;


    public IndexServiceImpl(IndexRepository indexRepository) {
        this.indexRepository = indexRepository;
    }

    public List<Index> findAll() {
        return indexRepository.findAll();
    }
}
