package com.backend.service;

import com.backend.dto.IndexDto;

import java.util.List;

public interface IndexService {
    List<IndexDto> findAll();

}
