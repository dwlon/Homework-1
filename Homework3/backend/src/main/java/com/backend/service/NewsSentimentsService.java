package com.backend.service;

import com.backend.dto.NewsSentimentsDto;

import java.util.List;

public interface NewsSentimentsService {
    List<NewsSentimentsDto> getNewsSentiments(String issuer);
}
