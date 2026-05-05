package com.insurex.policy;

import com.insurex.policy.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(JwtProperties.class)
public class PolicyManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(PolicyManagementApplication.class, args);
    }
}
