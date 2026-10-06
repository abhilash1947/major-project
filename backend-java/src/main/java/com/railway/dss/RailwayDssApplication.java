package com.railway.dss;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Railway Decision Support System - Main Application
 * 
 * Microservices entry point for Java backend:
 * - REST API Gateway
 * - Real-time data pipeline
 * - DSS query engine
 * - gRPC communication with Python service
 */
@SpringBootApplication
@Configuration
@EnableJpaRepositories(basePackages = "com.railway.dss.repository")
@EnableTransactionManagement
public class RailwayDssApplication {

    public static void main(String[] args) {
        SpringApplication.run(RailwayDssApplication.class, args);
    }
}
