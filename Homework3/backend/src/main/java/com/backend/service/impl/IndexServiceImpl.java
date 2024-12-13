package com.backend.service.impl;

import com.backend.dto.IndexDto;
import com.backend.entities.Index;
import com.backend.repository.IndexRepository;
import com.backend.service.IndexService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IndexServiceImpl implements IndexService {
    private final IndexRepository indexRepository;


    public IndexServiceImpl(IndexRepository indexRepository) {
        this.indexRepository = indexRepository;
    }

    public List<IndexDto> findAll() {
        List<Index> data = indexRepository.findAll();
        return data.stream()
                .map(IndexDto::fromEntity)
                .collect(Collectors.toList());
    }

}
