package com.example.demo.entities;

import java.io.Serializable;
import java.util.Date;
import java.util.Objects;

public class IndexKey implements Serializable {
    private String issuer;
    private String date;

    // Constructors
    public IndexKey() {}

    public IndexKey(String issuer, String date) {
        this.issuer = issuer;
        this.date = date;
    }

    // Getters and Setters
    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    // Override equals() and hashCode()
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        IndexKey indexKey = (IndexKey) o;
        return Objects.equals(issuer, indexKey.issuer) && Objects.equals(date, indexKey.date);
    }

    @Override
    public int hashCode() {
        return Objects.hash(issuer, date);
    }
}
