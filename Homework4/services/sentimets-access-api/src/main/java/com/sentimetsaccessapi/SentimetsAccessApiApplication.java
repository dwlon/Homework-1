package com.sentimetsaccessapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.InetAddress;

@SpringBootApplication
public class SentimetsAccessApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SentimetsAccessApiApplication.class, args);
		try {
			String hostAddress = InetAddress.getLocalHost().getHostAddress();
			String port = System.getProperty("server.port", "8080");
			System.out.println("Data Access API started at: http://" + hostAddress + ":" + port);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
