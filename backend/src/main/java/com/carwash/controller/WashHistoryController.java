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
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class WashHistoryController {

    private final WashHistoryService washHistoryService;

    @GetMapping("/wash-history")
    public ResponseEntity<ApiResponse<List<WashHistoryResponse>>> getWashHistory(Authentication authentication) {
        List<WashHistoryResponse> history = washHistoryService.getWashHistory(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
