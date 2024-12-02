package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.sql.Date;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "stock_data")
@NoArgsConstructor
@AllArgsConstructor
@IdClass(IndexKey.class)
public class Index implements Serializable {
    @Id
    private String issuer;
    @Id
    private String date;
    private Float last_trade_price;
    private Float max;
    private Float min;
    private Float avg_price;
    private Float percent_change;
    private Float volume;
    private Float turnover_best;
    private Float total_turnover;

}
