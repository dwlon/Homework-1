package com.stockmarketapp.controller;

import com.stockmarketapp.dto.IndexDto;
import com.stockmarketapp.service.IndexService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/api")
@Validated
@CrossOrigin(origins="*")
public class IndexController {
    IndexService indexService;

    public IndexController(IndexService indexService) {
        this.indexService = indexService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<IndexDto>> getAll() {
        List<IndexDto> dtoData = indexService.findAll();

        return new ResponseEntity<>(dtoData, HttpStatus.OK);
    }
}
