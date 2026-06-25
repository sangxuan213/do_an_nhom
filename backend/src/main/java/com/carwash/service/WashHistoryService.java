package com.carwash.service;
import com.carwash.dto.response.WashHistoryResponse;
import com.carwash.entity.User;
import com.carwash.enums.BookingStatus;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.mapper.WashHistoryMapper;
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
    private final WashHistoryMapper washHistoryMapper;
    /**
     * Gets all wash history records for the customer identified by email.
     *
     * @param email the customer's email address
     * @return the customer's wash history records ordered by booking date descending
     */
    public List<WashHistoryResponse> getCustomerWashHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return bookingRepository.findByUserIdOrderByBookingDateDesc(user.getId())
                .stream()
                .map(washHistoryMapper::toResponse)
                .collect(Collectors.toList());
    }
    /**
     * Retrieves the completed wash history for a customer by email.
     *
     * @param email the customer's email address
     * @return the completed wash history records for the customer
     * @throws ResourceNotFoundException if no user exists for the specified email
     */
    public List<WashHistoryResponse> getCompletedWashHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return bookingRepository.findByUserIdAndStatus(user.getId(), BookingStatus.COMPLETED)
                .stream()
                .map(washHistoryMapper::toResponse)
                .collect(Collectors.toList());
    }
}