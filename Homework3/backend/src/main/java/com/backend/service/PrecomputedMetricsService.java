// src/main/java/com/backend/service/PrecomputedMetricsService.java
package com.backend.service;

import com.backend.dto.PrecomputedMetricsDto;

public interface PrecomputedMetricsService {
    PrecomputedMetricsDto getMetrics(String issuer, String period);
}
