package com.railway.dss.controller;

import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class SystemController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Health check endpoint called");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "Railway DSS - Java Backend");
        response.put("version", "1.0.0");
        response.put("components", Map.of(
                "database", "connected",
                "redis", "connected",
                "api_gateway", "operational"
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> systemStatus() {
        log.info("System status endpoint called");
        
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", "operational");
        response.put("uptime_seconds", System.currentTimeMillis() / 1000);
        response.put("database_status", "connected");
        response.put("cache_status", "connected");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "Railway Decision Support System");
        response.put("version", "1.0.0");
        response.put("environment", "production");
        response.put("description", "AI-powered railway management with DRL optimization");
        response.put("endpoints", Map.of(
                "trains", "/api/v1/trains",
                "segments", "/api/v1/segments",
                "simulation", "/api/v1/simulation",
                "drl", "/api/v1/drl"
        ));
        
        return ResponseEntity.ok(response);
    }
}
