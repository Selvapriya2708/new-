package com.inb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for the Internet Banking Application
 * 
 * This application provides a comprehensive internet banking system with
 * features like account management, transactions, cheque deposits, bill payments, etc.
 */
@SpringBootApplication
@EnableScheduling
public class InternetBankingApplication {

    public static void main(String[] args) {
        SpringApplication.run(InternetBankingApplication.class, args);
    }
}
