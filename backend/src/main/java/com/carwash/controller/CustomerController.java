package com.carwash.controller;
import com.carwash.dto.request.CustomerRequest;
import com.carwash.dto.response.ApiResponse;
import com.carwash.dto.response.CustomerResponse;
import com.carwash.dto.response.LoyaltyResponse;
import com.carwash.service.CustomerService;
import com.carwash.service.LoyaltyService;
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
    private final LoyaltyService loyaltyService;
    // lấy hồ sơ
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerResponse>> getProfile(Authentication authentication) {
        CustomerResponse profile = customerService.getCustomerProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lay thong tin profile thanh cong", profile));
    }
    // cập nhật hồ sơ
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody CustomerRequest request) {
        CustomerResponse updated = customerService.updateCustomerProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Cap nhat thong tin profile thanh cong", updated));
    }
    // lấy thông tin điểm tích lũy
    @GetMapping("/loyalty")
    public ResponseEntity<ApiResponse<LoyaltyResponse>> getLoyalty(Authentication authentication) {
        LoyaltyResponse loyalty = loyaltyService.getLoyaltyProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lay thong tin loyalty thanh cong", loyalty));
    }
}
