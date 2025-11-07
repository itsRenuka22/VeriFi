package com.fraud.alerts;

import com.fraud.alerts.config.AlertsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AlertsProperties.class)
public class AlertsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AlertsServiceApplication.class, args);
    }
}
