// LSTMPredictionServiceImpl.java
package com.backend.service.impl;

import com.backend.dto.LSTMPredictionResponseDto;
import com.backend.dto.LSTMSummaryResponseDto;
import com.backend.dto.PredictionRowDto;
import com.backend.entities.EvaluationMetrics;
import com.backend.entities.Index;
import com.backend.entities.NextMonthPrediction;
import com.backend.repository.EvaluationMetricsRepository;
import com.backend.repository.NextMonthPredictionRepository;
import com.backend.service.LSTMPredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;
import java.util.stream.Collectors;

@Service
public class LSTMPredictionServiceImpl implements LSTMPredictionService {

    @Autowired
    private EvaluationMetricsRepository evaluationMetricsRepository;

    @Autowired
    private NextMonthPredictionRepository nextMonthPredictionRepository;

    @Override
    public LSTMPredictionResponseDto getPredictionsForIssuer(String issuer) {
        // 1) Get evaluation metrics
        EvaluationMetrics metrics = evaluationMetricsRepository.findByIssuer(issuer);
        if (metrics == null) {
            return null;  // or throw an exception
        }
        double currentPrice = metrics.getLast_trade_price();

        // 2) Get the next 30 day predictions
        List<NextMonthPrediction> predictions = nextMonthPredictionRepository.findByIssuerOrderByDateAsc(issuer);

        // You might want to pick which date is "tomorrow," "nextWeek," "nextMonth"
        // For simplicity, let's assume the list is always 30 days, sorted ascending:
        //   tomorrow = predictions.get(0)
        //   nextWeek = predictions.get(6)
        //   nextMonth = predictions.get(29)
        // (Check for index bounds in real code)

        if (predictions.size() < 20) {
            // Not enough predictions? Just handle gracefully
            return null;
        }

        double tomorrowPrice = predictions.get(0).getPredicted_price();
        double nextWeekPrice = predictions.get(5).getPredicted_price();
        double nextMonthPrice = predictions.get(predictions.size()-1).getPredicted_price();

        // 3) Prepare the response DTO
        LSTMPredictionResponseDto dto = new LSTMPredictionResponseDto();
        dto.setIssuer(issuer);
        dto.setR2Score(metrics.getR2());
        dto.setMeanAbsoluteError(metrics.getMae());
        dto.setRootMeanSquaredError(metrics.getRmse());
        dto.setLastTradPrice(currentPrice);

        dto.setTomorrowPrice(tomorrowPrice);
        dto.setTomorrowPercentChange(calcPercentChange(currentPrice, tomorrowPrice));

        dto.setNextWeekPrice(nextWeekPrice);
        dto.setNextWeekPercentChange(calcPercentChange(currentPrice, nextWeekPrice));

        dto.setNextMonthPrice(nextMonthPrice);
        dto.setNextMonthPercentChange(calcPercentChange(currentPrice, nextMonthPrice));

        // For the table
        List<PredictionRowDto> rowDtoList = predictions.stream()
                .map(pred -> {
                    PredictionRowDto row = new PredictionRowDto();
                    row.setDate(pred.getDate());
                    row.setPredictedPrice(pred.getPredicted_price());
                    row.setPercentChange(calcPercentChange(currentPrice, pred.getPredicted_price()));
                    return row;
                })
                .collect(Collectors.toList());

        dto.setPredictionRows(rowDtoList);

        return dto;
    }

    private Double calcPercentChange(double currentPrice, double futurePrice) {
        if (currentPrice == 0) return null;
        return ((futurePrice - currentPrice) / currentPrice) * 100.0;
    }

    @Override
    public List<String> findAllDistinctIssuers() {
        return evaluationMetricsRepository.findDistinctIssuers();
    }

    @Override
    public List<NextMonthPrediction> findAllLSTMPredictions() {
        List<NextMonthPrediction> data = nextMonthPredictionRepository.findAll();

        return data;
    }

    @Override
    public List<LSTMSummaryResponseDto> findLastPerIssuer() {
        // 1. Retrieve the latest prediction per issuer
        List<NextMonthPrediction> data = nextMonthPredictionRepository.findLatestPricePerIssuer();

        // 2. Initialize the list to hold DTOs
        List<LSTMSummaryResponseDto> summaryDtoList = new ArrayList<>();

        // 3. Iterate over each prediction and map to DTO
        for (NextMonthPrediction prediction : data) {
            String issuer = prediction.getIssuer();
            Double predictedPrice = prediction.getPredicted_price();

            // 4. Retrieve the current price from EvaluationMetrics
            EvaluationMetrics metrics = evaluationMetricsRepository.findByIssuer(issuer);
            if (metrics != null) {
                Double currentPrice = metrics.getLast_trade_price();
                Double percentChange = calcPercentChange(currentPrice, predictedPrice);

                // 5. Create and populate the DTO
                LSTMSummaryResponseDto summaryDto = new LSTMSummaryResponseDto();
                summaryDto.setIssuer(issuer);
                summaryDto.setNextMonthPrice(predictedPrice);
                summaryDto.setNextMonthPercentChange(percentChange);

                // 6. Add the DTO to the list
                summaryDtoList.add(summaryDto);
            } else {
                // Handle cases where EvaluationMetrics is not found for the issuer
                // You can choose to skip, log, or handle it as per your requirements
                // For example, skipping the issuer:
                continue;
            }
        }

        // 7. Return the populated list of DTOs
        return summaryDtoList;
    }

}
