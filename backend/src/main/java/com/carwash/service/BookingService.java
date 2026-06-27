package com.carwash.service;

import com.carwash.dto.request.BookingRequest;
import com.carwash.dto.response.BookingResponse;
import com.carwash.dto.response.ServicePackageResponse;
import com.carwash.dto.response.TimeSlotResponse;
import com.carwash.entity.Booking;
import com.carwash.entity.ServicePackage;
import com.carwash.entity.User;
import com.carwash.enums.BookingStatus;
import com.carwash.exception.BadRequestException;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.repository.BookingRepository;
import com.carwash.repository.ServicePackageRepository;
import com.carwash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final UserRepository userRepository;
    private final LoyaltyService loyaltyService;
    private final TierBookingWindowPolicy tierBookingWindowPolicy;
    private final TierQueuePolicy tierQueuePolicy;

    // Maximum concurrent bookings per time slot
    private static final int MAX_BOOKINGS_PER_SLOT = 3;

    // Available time slots (8 AM to 6 PM, hourly)
    private static final List<String> TIME_SLOTS = List.of(
            "08:00", "09:00", "10:00", "11:00", "12:00",
            "13:00", "14:00", "15:00", "16:00", "17:00"
    );

    @Transactional
    public BookingResponse createBooking(String userEmail, BookingRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        ServicePackage servicePackage = servicePackageRepository.findById(request.getServicePackageId())
                .orElseThrow(() -> new ResourceNotFoundException("ServicePackage", "id", request.getServicePackageId()));

        if (!servicePackage.getActive()) {
            throw new BadRequestException("This service package is no longer available");
        }

        LocalDate bookingDate;
        try {
            bookingDate = LocalDate.parse(request.getBookingDate());
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Invalid date format. Use YYYY-MM-DD");
        }

        if (bookingDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot book a date in the past");
        }

        // Kiem tra gioi han ngay dat truoc theo hang the
        if (!tierBookingWindowPolicy.canBookAdvance(user.getLoyaltyTier(), bookingDate)) {
            throw new BadRequestException("Your membership tier does not allow booking this far in advance.");
        }

        if (!TIME_SLOTS.contains(request.getTimeSlot())) {
            throw new BadRequestException("Invalid time slot. Available slots: " + TIME_SLOTS);
        }

        // Check slot availability
        List<Booking> existingBookings = bookingRepository
                .findByBookingDateAndTimeSlot(bookingDate, request.getTimeSlot());
        long activeBookings = existingBookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .count();

        if (activeBookings >= MAX_BOOKINGS_PER_SLOT) {
            throw new BadRequestException("This time slot is fully booked. Please choose another slot.");
        }

        // Calculate discount from redeemed points
        BigDecimal discountApplied = BigDecimal.ZERO;
        int pointsRedeemed = 0;
        if (request.getRedeemPoints() > 0) {
            if (request.getRedeemPoints() > user.getLoyaltyPoints()) {
                throw new BadRequestException("Insufficient loyalty points. You have " + user.getLoyaltyPoints() + " points.");
            }
            pointsRedeemed = request.getRedeemPoints();
            // 100 points = $1 discount
            discountApplied = BigDecimal.valueOf(pointsRedeemed / 100.0);
            if (discountApplied.compareTo(servicePackage.getPrice()) > 0) {
                discountApplied = servicePackage.getPrice();
                pointsRedeemed = servicePackage.getPrice().multiply(BigDecimal.valueOf(100)).intValue();
            }
        }

        // Tinh toan do uu tien vao hang cho dua tren hang the
        int queuePriority = tierQueuePolicy.calculateQueuePriority(user.getLoyaltyTier());

        Booking booking = Booking.builder()
                .user(user)
                .servicePackage(servicePackage)
                .bookingDate(bookingDate)
                .timeSlot(request.getTimeSlot())
                .licensePlate(request.getLicensePlate())
                .vehicleType(request.getVehicleType())
                .notes(request.getNotes())
                .totalCost(request.getTotalCost() != null ? request.getTotalCost() : servicePackage.getPrice().subtract(discountApplied))
                .addOnIds(request.getAddOnIds() != null ? request.getAddOnIds() : new ArrayList<>())
                .status(BookingStatus.PENDING)
                .pointsEarned(0)
                .pointsRedeemed(pointsRedeemed)
                .discountApplied(discountApplied)
                .queuePriority(queuePriority)
                .build();

        booking = bookingRepository.save(booking);

        // Deduct redeemed points
        if (pointsRedeemed > 0) {
            user.setLoyaltyPoints(user.getLoyaltyPoints() - pointsRedeemed);
            userRepository.save(user);
        }

        return mapToBookingResponse(booking);
    }

    public List<BookingResponse> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        return bookingRepository.findByUserIdOrderByBookingDateDesc(user.getId())
                .stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("You do not have access to this booking");
        }

        return mapToBookingResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("You do not have access to this booking");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        // Refund redeemed points
        if (booking.getPointsRedeemed() > 0) {
            User user = booking.getUser();
            user.setLoyaltyPoints(user.getLoyaltyPoints() + booking.getPointsRedeemed());
            userRepository.save(user);
        }

        booking = bookingRepository.save(booking);
        return mapToBookingResponse(booking);
    }

    public List<TimeSlotResponse> getAvailableSlots(String dateStr) {
        LocalDate date;
        try {
            date = LocalDate.parse(dateStr);
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Invalid date format. Use YYYY-MM-DD");
        }

        List<Booking> bookingsOnDate = bookingRepository.findActiveBookingsByDate(date);

        return TIME_SLOTS.stream().map(slot -> {
            long bookedCount = bookingsOnDate.stream()
                    .filter(b -> b.getTimeSlot().equals(slot))
                    .count();
            return TimeSlotResponse.builder()
                    .time(slot)
                    .available(bookedCount < MAX_BOOKINGS_PER_SLOT)
                    .build();
        }).collect(Collectors.toList());
    }

    // ===== Admin Methods =====

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(status);

        // Award points when booking is completed
        if (status == BookingStatus.COMPLETED && oldStatus != BookingStatus.COMPLETED) {
            int pointsEarned = booking.getServicePackage().getPointsEarned();
            booking.setPointsEarned(pointsEarned);
            loyaltyService.awardPoints(booking.getUser().getId(), pointsEarned);
        }

        booking = bookingRepository.save(booking);
        return mapToBookingResponse(booking);
    }

    // ===== Service Package Methods =====

    public List<ServicePackageResponse> getActiveServicePackages() {
        return servicePackageRepository.findByActiveTrue()
                .stream()
                .map(this::mapToServicePackageResponse)
                .collect(Collectors.toList());
    }

    public List<ServicePackageResponse> getAllServicePackages() {
        return servicePackageRepository.findAll()
                .stream()
                .map(this::mapToServicePackageResponse)
                .collect(Collectors.toList());
    }

    // ===== Mappers =====

    private BookingResponse mapToBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .user(AuthService.mapToUserResponse(booking.getUser()))
                .servicePackage(mapToServicePackageResponse(booking.getServicePackage()))
                .bookingDate(booking.getBookingDate().toString())
                .timeSlot(booking.getTimeSlot())
                .status(booking.getStatus())
                .pointsEarned(booking.getPointsEarned())
                .pointsRedeemed(booking.getPointsRedeemed())
                .discountApplied(booking.getDiscountApplied())
                .createdAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null)
                .licensePlate(booking.getLicensePlate())
                .vehicleType(booking.getVehicleType())
                .notes(booking.getNotes())
                .totalCost(booking.getTotalCost())
                .addOnIds(booking.getAddOnIds())
                .build();
    }

    private ServicePackageResponse mapToServicePackageResponse(ServicePackage sp) {
        return ServicePackageResponse.builder()
                .id(sp.getId())
                .name(sp.getName())
                .description(sp.getDescription())
                .price(sp.getPrice())
                .durationMinutes(sp.getDurationMinutes())
                .pointsEarned(sp.getPointsEarned())
                .active(sp.getActive())
                .build();
    }
}
