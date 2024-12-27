package com.backend.service.impl;

import com.backend.dto.NewsSentimentsDto;
import com.backend.entities.NewsSentiments;
import com.backend.repository.NewsSentimentsRepository;
import com.backend.service.NewsSentimentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NewsSentimentsServiceImpl implements NewsSentimentsService {

    @Autowired
    private NewsSentimentsRepository newsSentimentsRepository;

    @Override
    public List<NewsSentimentsDto> getNewsSentiments(String issuer) {
        List<NewsSentiments> sentimentsList = newsSentimentsRepository.findByIssuer(issuer);

        // Map entities to DTOs
        return sentimentsList.stream()
                .map(sentiments -> {
                    NewsSentimentsDto dto = new NewsSentimentsDto();
                    dto.setIssuer(sentiments.getIssuer());
                    dto.setLink(sentiments.getLink());
                    dto.setDate(sentiments.getDate());
                    dto.setTitle(sentiments.getTitle());
                    dto.setContent(sentiments.getContent());
                    dto.setSentiment(sentiments.getSentiment());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
