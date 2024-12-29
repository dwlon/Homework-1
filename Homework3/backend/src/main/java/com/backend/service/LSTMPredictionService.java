// LSTMPredictionService.java
package com.backend.service;

import com.backend.dto.LSTMPredictionResponseDto;
import com.backend.dto.LSTMSummaryResponseDto;
import com.backend.entities.NextMonthPrediction;

import java.util.List;

public interface LSTMPredictionService {
    LSTMPredictionResponseDto getPredictionsForIssuer(String issuer);
    List<String> findAllDistinctIssuers();
    public List<NextMonthPrediction> findAllLSTMPredictions();
    List<LSTMSummaryResponseDto> findLastPerIssuer();
}
