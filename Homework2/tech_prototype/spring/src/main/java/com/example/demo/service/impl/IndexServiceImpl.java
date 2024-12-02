package com.example.demo.service.impl;

import com.example.demo.entities.Index;
import com.example.demo.repository.IndexRepository;
import com.example.demo.service.IndexService;
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
