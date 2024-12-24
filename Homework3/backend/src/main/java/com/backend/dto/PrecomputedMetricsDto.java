// src/main/java/com/backend/dto/PrecomputedMetricsDto.java
package com.backend.dto;

import lombok.Data;

@Data
public class PrecomputedMetricsDto {
    private String issuer;
    private String period;
    private String start_date;
    private String end_date;
    private Double rsi;
    private Double macd;
    private Double stoch;
    private Double ao;
    private Double williams;
    private Double cci;
    private Double sma;
    private Double ema;
    private Double wma;
    private Double hma;
    private Double ibl;

    // Getters and Setters

    // Constructors

    public PrecomputedMetricsDto() {}

    // Add all getters and setters here
    // ...
}
