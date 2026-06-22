package com.carwash;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class CarWashApplication {
    public static void main(String[] args) {
        // In ra hash của mật khẩu
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("admin123 -> " + encoder.encode("admin123"));
        System.out.println("customer123 -> " + encoder.encode("customer123"));
        SpringApplication.run(CarWashApplication.class, args);
    }
}