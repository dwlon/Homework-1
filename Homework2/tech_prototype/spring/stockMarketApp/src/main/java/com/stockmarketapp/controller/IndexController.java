package com.stockmarketapp.controller;

import com.stockmarketapp.entities.Index;
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
    public ResponseEntity<List<Index>> getAll() {
        return new ResponseEntity<>(indexService.findAll(), HttpStatus.OK);
    }
}
