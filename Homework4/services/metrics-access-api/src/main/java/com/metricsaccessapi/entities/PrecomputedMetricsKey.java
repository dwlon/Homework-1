package com.metricsaccessapi.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrecomputedMetricsKey implements Serializable {
    private String issuer;
    private String period;
}
