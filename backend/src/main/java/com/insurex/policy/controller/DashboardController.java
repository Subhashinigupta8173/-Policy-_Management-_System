package com.insurex.policy.controller;

import com.insurex.policy.dto.response.AdminDashboardResponse;
import com.insurex.policy.dto.response.CustomerDashboardResponse;
import com.insurex.policy.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CustomerDashboardResponse> customerDash(Authentication auth) {
        return ResponseEntity.ok(dashboardService.customerDashboard(auth.getName()));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('UNDERWRITER','ADJUSTER')")
    public ResponseEntity<AdminDashboardResponse> adminDash() {
        return ResponseEntity.ok(dashboardService.adminDashboard());
    }
}
