package com.backend.service;

import com.backend.dto.PerformanceMetricsDto;

public interface PerformanceMetricsService {
    PerformanceMetricsDto getPerformanceMetrics(String issuer);
}
