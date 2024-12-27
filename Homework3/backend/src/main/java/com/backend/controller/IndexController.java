package com.backend.controller;

import com.backend.dto.IndexDto;
import com.backend.dto.NewsSentimentsDto;
import com.backend.dto.PerformanceMetricsDto;
import com.backend.dto.PrecomputedMetricsDto;
import com.backend.service.IndexService;
import com.backend.service.NewsSentimentsService;
import com.backend.service.PerformanceMetricsService;
import com.backend.service.PrecomputedMetricsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/api")
@Validated
@CrossOrigin(origins="*")
public class IndexController {
    IndexService indexService;
    PrecomputedMetricsService metricsService;
    PerformanceMetricsService performanceMetricsService;
    NewsSentimentsService newsSentimentsService;

    public IndexController(IndexService indexService, PrecomputedMetricsService metricsService, PerformanceMetricsService performanceMetricsService, NewsSentimentsService newsSentimentsService) {
        this.indexService = indexService;
        this.metricsService = metricsService;
        this.performanceMetricsService = performanceMetricsService;
        this.newsSentimentsService = newsSentimentsService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<IndexDto>> getAll() {
        List<IndexDto> dtoData = indexService.findAll();

        return new ResponseEntity<>(dtoData, HttpStatus.OK);
    }

    /**
     * Endpoint to get the last seven days of data for each issuer.
     * Example: GET /api/last-seven-days
     */
    @GetMapping("/last-seven-days")
    public ResponseEntity<Map<String, List<IndexDto>>> getLastSevenDaysPerIssuer() {
        Map<String, List<IndexDto>> data = indexService.findLastSevenDaysPerIssuer();
        return new ResponseEntity<>(data, HttpStatus.OK);
    }

    /**
     * Endpoint to get data for a specified issuer between startDate and endDate.
     * Example: GET /api/issuer-data?issuer=ABC&startDate=2023-01-01&endDate=2023-01-31
     */
    @GetMapping("/issuer-data")
    public ResponseEntity<List<IndexDto>> getIssuerData(
            @RequestParam String issuer,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        List<IndexDto> data = indexService.findByIssuerAndDateRange(issuer, startDate, endDate);
        return new ResponseEntity<>(data, HttpStatus.OK);
    }

    /**
     * Endpoint to get all distinct issuers.
     * Example: GET /api/issuers
     */
    @GetMapping("/issuers")
    public ResponseEntity<List<String>> getAllIssuers() {
        List<String> issuers = indexService.findAllDistinctIssuers();
        return new ResponseEntity<>(issuers, HttpStatus.OK);
    }

    /**
     * Endpoint to get precomputed metrics for a specific issuer and period.
     * Example: GET /api/precomputed-metrics?issuer=ALK&period=1d
     */
    @GetMapping("/precomputed-metrics")
    public ResponseEntity<PrecomputedMetricsDto> getPrecomputedMetrics(
            @RequestParam String issuer,
            @RequestParam String period
    ) {
        PrecomputedMetricsDto dto = metricsService.getMetrics(issuer, period);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/performance-metrics")
    public ResponseEntity<PerformanceMetricsDto> getPerformanceMetrics(
            @RequestParam String issuer
    ) {
        PerformanceMetricsDto dto = performanceMetricsService.getPerformanceMetrics(issuer);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/news-sentiments")
    public ResponseEntity<List<NewsSentimentsDto>> getNewsSentiments(
            @RequestParam String issuer
    ) {
        List<NewsSentimentsDto> dtos = newsSentimentsService.getNewsSentiments(issuer);
        if (!dtos.isEmpty()) {
            return ResponseEntity.ok(dtos);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
