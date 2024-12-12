package com.stockmarketapp.service;

import com.stockmarketapp.dto.IndexDto;

import java.util.List;

public interface IndexService {
    List<IndexDto> findAll();

}
