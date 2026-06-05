package com.carwash.entity;

import com.carwash.enums.BookingStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.carwash.enums.VehicleType;

@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_booking_date", columnList = "booking_date"),
        @Index(name = "idx_booking_status", columnList = "status"),
        @Index(name = "idx_booking_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== Relationships =====

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_package_id", nullable = false)
    @NotNull(message = "Service package is required")
    private ServicePackage servicePackage;

    // ===== Booking Details =====

    @NotNull(message = "Booking date is required")
    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @NotBlank(message = "Time slot is required")
    @Column(name = "time_slot", nullable = false, length = 20)
    private String timeSlot;

    @Column(name = "license_plate", length = 20)
    private String licensePlate;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", length = 20)
    private VehicleType vehicleType;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "total_cost", precision = 12, scale = 2)
    private BigDecimal totalCost;

    @ElementCollection
    @CollectionTable(name = "booking_add_ons", joinColumns = @JoinColumn(name = "booking_id"))
    @Column(name = "add_on_id")
    @Builder.Default
    private List<String> addOnIds = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    // ===== Points & Discount =====

    @Column(name = "points_earned", nullable = false)
    @Builder.Default
    @Min(value = 0)
    private Integer pointsEarned = 0;

    @Column(name = "discount_applied", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountApplied = BigDecimal.ZERO;

    @Column(name = "points_redeemed", nullable = false)
    @Builder.Default
    @Min(value = 0)
    private Integer pointsRedeemed = 0;

    // ===== Timestamps =====

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
