package com.backend.service;

import com.backend.dto.IndexDto;

import java.util.List;
import java.util.Map;

public interface IndexService {
    List<IndexDto> findAll();
    Map<String, List<IndexDto>> findLastSevenDaysPerIssuer();

    // Fetch data for a specified issuer between dateStart and dateEnd
    List<IndexDto> findByIssuerAndDateRange(String issuer, String startDate, String endDate);

    // Fetch all distinct issuers
    List<String> findAllDistinctIssuers();
}
