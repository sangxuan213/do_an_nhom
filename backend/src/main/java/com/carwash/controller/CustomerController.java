package com.carwash.controller;

import com.carwash.dto.request.CustomerProfileRequest;
import com.carwash.dto.response.ApiResponse;
import com.carwash.dto.response.CustomerProfileResponse;
import com.carwash.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> getProfile(Authentication authentication) {
        CustomerProfileResponse profile = customerService.getCustomerProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody CustomerProfileRequest request) {
        CustomerProfileResponse profile = customerService.updateCustomerProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }
}
