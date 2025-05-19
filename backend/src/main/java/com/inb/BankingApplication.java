package com.inb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main application class for the iNB Banking System.
 * This class serves as the entry point for the Spring Boot application.
 */
@SpringBootApplication
@EnableScheduling
@EnableTransactionManagement
public class BankingApplication {

    public static void main(String[] args) {
        SpringApplication.run(BankingApplication.class, args);
    }
}
