// PredictionRowDto.java
package com.backend.dto;

import lombok.Data;

@Data
public class PredictionRowDto {
    private String date;
    private Double predictedPrice;
    private Double percentChange;
}
