package com.carwash.customer.entity;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "customers")
@Getter
@Setter
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "account_id", nullable = false, unique = true)
    private Long accountId;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(nullable = false, unique = true, length = 15)
    private String phone;
    @Column(name = "license_plate", length = 20)
    private String licensePlate;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

}
