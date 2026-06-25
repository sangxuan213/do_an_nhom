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
    /**
     * Gets the authenticated customer's profile.
     *
     * @param authentication the current authentication token
     * @return the customer profile wrapped in a successful response
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerResponse>> getProfile(Authentication authentication) {
        CustomerResponse profile = customerService.getCustomerProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lay thong tin profile thanh cong", profile));
    }
    /**
     * Updates the authenticated customer's profile.
     *
     * @param  request the profile data to apply
     * @return         the updated customer profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody CustomerRequest request) {
        CustomerResponse updated = customerService.updateCustomerProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Cap nhat thong tin profile thanh cong", updated));
    }
    /**
     * Retrieves the authenticated customer's loyalty information.
     *
     * @param authentication the current authentication principal
     * @return the customer's loyalty information wrapped in a success response
     */
    @GetMapping("/loyalty")
    public ResponseEntity<ApiResponse<LoyaltyResponse>> getLoyalty(Authentication authentication) {
        LoyaltyResponse loyalty = loyaltyService.getLoyaltyProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lay thong tin loyalty thanh cong", loyalty));
    }
}
