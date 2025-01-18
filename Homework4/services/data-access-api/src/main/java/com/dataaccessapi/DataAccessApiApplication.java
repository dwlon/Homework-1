package com.dataaccessapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.InetAddress;

@SpringBootApplication
public class DataAccessApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(DataAccessApiApplication.class, args);
        try {
            String hostAddress = InetAddress.getLocalHost().getHostAddress();
            String port = System.getProperty("server.port", "8080");
            System.out.println("Data Access API started at: http://" + hostAddress + ":" + port);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
