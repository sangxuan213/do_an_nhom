package com.carwash.customer.controller;

import com.carwash.customer.dto.request.CustomerRequest;
import com.carwash.customer.dto.response.CustomerResponse;
import com.carwash.customer.service.ICustomerService;
import com.carwash.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {
    
    private final ICustomerService customerService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerResponse>> getProfile(Authentication authentication) {
        CustomerResponse profile = customerService.getCustomerProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateProfile(
            Authentication authentication,
            @RequestBody CustomerRequest request) {
        CustomerResponse updated = customerService.updateCustomerProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }
}