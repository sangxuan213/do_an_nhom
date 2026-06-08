package com.carwash.mapper;

import com.carwash.dto.response.CustomerProfileResponse;
import com.carwash.dto.response.WashHistoryResponse;
import com.carwash.entity.Booking;
import com.carwash.entity.Customer;
import com.carwash.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "id", source = "customer.id")
    @Mapping(target = "fullName", source = "customer.name")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "phone", source = "customer.phone")
    @Mapping(target = "licensePlate", source = "customer.licensePlate")
    @Mapping(target = "loyaltyPoints", source = "user.loyaltyPoints")
    @Mapping(target = "loyaltyTier", source = "user.loyaltyTier")
    @Mapping(target = "createdAt", source = "customer.createdAt", dateFormat = "yyyy-MM-dd HH:mm:ss")
    CustomerProfileResponse toProfileResponse(Customer customer, User user);

    @Mapping(target = "id", source = "user.id")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "licensePlate", constant = "")
    @Mapping(target = "loyaltyPoints", source = "user.loyaltyPoints")
    @Mapping(target = "loyaltyTier", source = "user.loyaltyTier")
    @Mapping(target = "createdAt", source = "user.createdAt", dateFormat = "yyyy-MM-dd HH:mm:ss")
    CustomerProfileResponse toProfileResponseFromUser(User user);

    @Mapping(target = "servicePackageName", source = "booking.servicePackage.name")
    @Mapping(target = "bookingDate", source = "booking.bookingDate", dateFormat = "yyyy-MM-dd")
    @Mapping(target = "createdAt", source = "booking.createdAt", dateFormat = "yyyy-MM-dd HH:mm:ss")
    WashHistoryResponse toWashHistoryResponse(Booking booking);
}
