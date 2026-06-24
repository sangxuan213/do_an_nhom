package com.carwash.repository;

import com.carwash.entity.Booking;
import com.carwash.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);

    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);

    List<Booking> findByBookingDate(LocalDate bookingDate);

    List<Booking> findByBookingDateAndTimeSlot(LocalDate bookingDate, String timeSlot);

    @Query("SELECT b FROM Booking b WHERE b.bookingDate = :date AND b.status NOT IN ('CANCELLED')")
    List<Booking> findActiveBookingsByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId AND b.status = 'COMPLETED'")
    long countCompletedBookingsByUserId(@Param("userId") Long userId);

    List<Booking> findByStatusOrderByBookingDateAsc(BookingStatus status);

    @Query("SELECT b FROM Booking b ORDER BY b.createdAt DESC")
    List<Booking> findAllOrderByCreatedAtDesc();
}
