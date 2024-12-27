package com.backend.dto;

import jakarta.persistence.Id;
import lombok.Data;

@Data
public class NewsSentimentsDto {
    private String issuer;
    private String link;
    private String date;
    private String title;
    private String content;
    private String sentiment;

    public NewsSentimentsDto() {}
}
