package com.carwash.service;

import com.carwash.dto.response.WashHistoryResponse;
import com.carwash.entity.Booking;
import com.carwash.entity.User;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.mapper.CustomerMapper;
import com.carwash.repository.BookingRepository;
import com.carwash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WashHistoryService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CustomerMapper customerMapper;

    public List<WashHistoryResponse> getWashHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        List<Booking> bookings = bookingRepository.findByUserIdOrderByBookingDateDesc(user.getId());

        return bookings.stream()
                .map(customerMapper::toWashHistoryResponse)
                .collect(Collectors.toList());
    }
}
