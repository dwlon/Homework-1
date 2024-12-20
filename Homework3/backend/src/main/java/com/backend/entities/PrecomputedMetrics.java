// src/main/java/com/backend/entities/PrecomputedMetrics.java
package com.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Entity
@Table(name = "precomputed_metrics")
@NoArgsConstructor
@AllArgsConstructor
@IdClass(PrecomputedMetricsKey.class)
public class PrecomputedMetrics {
    @Id
    private String issuer;
    @Id
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


    // Add all getters and setters here
    // ...
}
