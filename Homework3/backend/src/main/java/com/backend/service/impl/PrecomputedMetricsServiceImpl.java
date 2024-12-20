// src/main/java/com/backend/service/impl/PrecomputedMetricsServiceImpl.java
package com.backend.service.impl;

import com.backend.dto.PrecomputedMetricsDto;
import com.backend.entities.PrecomputedMetrics;
import com.backend.repository.PrecomputedMetricsRepository;
import com.backend.service.PrecomputedMetricsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PrecomputedMetricsServiceImpl implements PrecomputedMetricsService {

    @Autowired
    private PrecomputedMetricsRepository metricsRepository;

    @Override
    public PrecomputedMetricsDto getMetrics(String issuer, String period) {
        Optional<PrecomputedMetrics> metricsOpt = metricsRepository.findByIssuerAndPeriod(issuer, period);
        if (metricsOpt.isPresent()) {
            PrecomputedMetrics metrics = metricsOpt.get();
            PrecomputedMetricsDto dto = new PrecomputedMetricsDto();
            dto.setIssuer(metrics.getIssuer());
            dto.setPeriod(metrics.getPeriod());
            dto.setStart_date(metrics.getStart_date());
            dto.setEnd_date(metrics.getEnd_date());
            dto.setRsi(metrics.getRsi());
            dto.setMacd(metrics.getMacd());
            dto.setStoch(metrics.getStoch());
            dto.setAo(metrics.getAo());
            dto.setWilliams(metrics.getWilliams());
            dto.setCci(metrics.getCci());
            dto.setSma(metrics.getSma());
            dto.setEma(metrics.getEma());
            dto.setWma(metrics.getWma());
            dto.setHma(metrics.getHma());
            dto.setIbl(metrics.getIbl());
            return dto;
        } else {
            return null; // Or throw an exception based on your error handling strategy
        }
    }
}
