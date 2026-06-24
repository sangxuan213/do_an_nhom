package com.carwash.customer.mapper;

import com.carwash.customer.dto.request.CustomerRequest;
import com.carwash.customer.dto.response.CustomerResponse;
import com.carwash.dto.response.WashHistoryResponse;
import com.carwash.entity.Booking;
import com.carwash.customer.entity.Customer;
import org.springframework.stereotype.Component;
import java.time.format.DateTimeFormatter;

@Component
public class CustomerMapper implements ICustomerMapper {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public CustomerResponse toResponse(Customer customer) {
        if (customer == null) {
            return null;
        }
        CustomerResponse response = new CustomerResponse();
        response.setId(customer.getId());
        if (customer.getUser() != null) {
            response.setAccountId(customer.getUser().getId());
        }
        response.setName(customer.getName());
        response.setPhone(customer.getPhone());
        response.setLicensePlate(customer.getLicensePlate());
        response.setPoint(customer.getPoint());
        response.setCreatedAt(customer.getCreatedAt());
        return response;
    }

    @Override
    public Customer toEntity(CustomerRequest request) {
        if (request == null) {
            return null;
        }
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setLicensePlate(request.getLicensePlate());
        customer.setPoint(0);
        return customer;
    }

    @Override
    public WashHistoryResponse toWashHistoryResponse(Booking booking) {
        if (booking == null) {
            return null;
        }
        WashHistoryResponse response = new WashHistoryResponse();
        response.setId(booking.getId());
        if (booking.getServicePackage() != null) {
            response.setServicePackageName(booking.getServicePackage().getName());
        }
        if (booking.getBookingDate() != null) {
            response.setBookingDate(booking.getBookingDate().format(DATE_FORMATTER));
        }
        response.setTimeSlot(booking.getTimeSlot());
        response.setLicensePlate(booking.getLicensePlate());
        response.setTotalCost(booking.getTotalCost());
        response.setStatus(booking.getStatus());
        response.setPointsEarned(booking.getPointsEarned());
        if (booking.getCreatedAt() != null) {
            response.setCreatedAt(booking.getCreatedAt().format(DATETIME_FORMATTER));
        }
        return response;
    }
}
