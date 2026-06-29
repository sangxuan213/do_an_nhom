package com.carwash.controller;

import com.carwash.dto.request.BookingRequest;
import com.carwash.dto.response.ApiResponse;
import com.carwash.dto.response.BookingResponse;
import com.carwash.dto.response.TimeSlotResponse;
import com.carwash.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            Authentication authentication,
            @Valid @RequestBody BookingRequest request) {
        BookingResponse booking = bookingService.createBooking(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully", booking));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(Authentication authentication) {
        List<BookingResponse> bookings = bookingService.getUserBookings(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {
        BookingResponse booking = bookingService.getBookingById(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        BookingResponse booking = bookingService.cancelBooking(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
    }

    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<TimeSlotResponse>>> getAvailableSlots(@RequestParam String date) {
        List<TimeSlotResponse> slots = bookingService.getAvailableSlots(date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }
}
