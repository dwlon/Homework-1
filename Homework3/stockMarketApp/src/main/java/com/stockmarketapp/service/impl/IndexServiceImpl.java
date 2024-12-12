package com.stockmarketapp.service.impl;

import com.stockmarketapp.dto.IndexDto;
import com.stockmarketapp.entities.Index;
import com.stockmarketapp.repository.IndexRepository;
import com.stockmarketapp.service.IndexService;
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
