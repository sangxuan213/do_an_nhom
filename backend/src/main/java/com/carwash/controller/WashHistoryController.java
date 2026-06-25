package com.carwash.controller;
import com.carwash.dto.response.ApiResponse;
import com.carwash.dto.response.WashHistoryResponse;
import com.carwash.service.WashHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
@RestController
@RequestMapping("/api/customer/wash-history")
@RequiredArgsConstructor
public class WashHistoryController {
    private final WashHistoryService washHistoryService;
    /**
     * Retrieves the authenticated customer's wash history.
     *
     * @param  authentication the current authenticated principal used to identify the customer
     * @return                a response containing the customer's wash history
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<WashHistoryResponse>>> getWashHistory(Authentication authentication) {
        List<WashHistoryResponse> history = washHistoryService.getCustomerWashHistory(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lay lich su dat lich thanh cong", history));
    }
    /**
     * Retrieves the authenticated customer's completed wash history.
     *
     * @param authentication the authenticated customer principal
     * @return a response containing the customer's completed wash history
     */
    @GetMapping("/completed")
    public ResponseEntity<ApiResponse<List<WashHistoryResponse>>> getCompletedWashHistory(Authentication authentication) {
        List<WashHistoryResponse> history = washHistoryService.getCompletedWashHistory(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lay lich su hoan thanh thanh cong", history));
    }
}