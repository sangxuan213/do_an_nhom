package com.carwash.config;

import com.carwash.entity.MachineStatus;
import com.carwash.entity.ServicePackage;
import com.carwash.entity.TierConfig;
import com.carwash.entity.User;
import com.carwash.enums.LoyaltyTier;
import com.carwash.enums.MachineState;
import com.carwash.enums.Role;
import com.carwash.repository.MachineStatusRepository;
import com.carwash.repository.ServicePackageRepository;
import com.carwash.repository.TierConfigRepository;
import com.carwash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final MachineStatusRepository machineStatusRepository;
    private final TierConfigRepository tierConfigRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedTierConfigs();
        seedUsers();
        seedServicePackages();
        seedMachines();
    }

    private void seedTierConfigs() {
        if (tierConfigRepository.count() == 0) {
            List<TierConfig> configs = List.of(
                    TierConfig.builder().tier(LoyaltyTier.BRONZE).minPoints(0).pointRateMultiplier(1.0)
                            .perks("Tiêu chuẩn").build(),
                    TierConfig.builder().tier(LoyaltyTier.SILVER).minPoints(500).pointRateMultiplier(1.2)
                            .perks("Giảm 5%").build(),
                    TierConfig.builder().tier(LoyaltyTier.GOLD).minPoints(1500).pointRateMultiplier(1.5)
                            .perks("Giảm 10%, Ưu tiên").build());
            tierConfigRepository.saveAll(configs);
        }
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@carwash.com")) {
            User admin = User.builder()
                    .fullName("System Admin")
                    .email("admin@carwash.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("+1-000-000-0000")
                    .role(Role.ROLE_ADMIN)
                    .loyaltyPoints(0)
                    .loyaltyTier(LoyaltyTier.BRONZE)
                    .build();
            userRepository.save(admin);
        }

        if (!userRepository.existsByEmail("customer@carwash.com")) {
            User customer = User.builder()
                    .fullName("Demo Customer")
                    .email("customer@carwash.com")
                    .password(passwordEncoder.encode("customer123"))
                    .phone("+1-555-123-4567")
                    .role(Role.ROLE_CUSTOMER)
                    .loyaltyPoints(650)
                    .loyaltyTier(LoyaltyTier.SILVER)
                    .build();
            userRepository.save(customer);
        }
    }

    private void seedServicePackages() {
        if (servicePackageRepository.count() == 0) {
            List<ServicePackage> packages = List.of(
                    ServicePackage.builder()
                            .name("Basic Wash")
                            .description("Exterior wash and dry, tire dressing, and window cleaning.")
                            .price(new BigDecimal("15.00"))
                            .durationMinutes(30)
                            .pointsEarned(15)
                            .active(true)
                            .build(),
                    ServicePackage.builder()
                            .name("Premium Wash")
                            .description("Basic wash + interior vacuum, dashboard wipe, and wax.")
                            .price(new BigDecimal("30.00"))
                            .durationMinutes(60)
                            .pointsEarned(35)
                            .active(true)
                            .build(),
                    ServicePackage.builder()
                            .name("VIP Detailing")
                            .description(
                                    "Full interior/exterior detailing, leather treatment, and ceramic coating touch-up.")
                            .price(new BigDecimal("80.00"))
                            .durationMinutes(120)
                            .pointsEarned(100)
                            .active(true)
                            .build());
            servicePackageRepository.saveAll(packages);
        }
    }

    private void seedMachines() {
        if (machineStatusRepository.count() == 0) {
            List<MachineStatus> machines = List.of(
                    MachineStatus.builder().machineName("Wash Bay 1").state(MachineState.AVAILABLE).build(),
                    MachineStatus.builder().machineName("Wash Bay 2").state(MachineState.AVAILABLE).build(),
                    MachineStatus.builder().machineName("Detailing Station A").state(MachineState.AVAILABLE).build(),
                    MachineStatus.builder().machineName("Detailing Station B").state(MachineState.MAINTENANCE).build());
            machineStatusRepository.saveAll(machines);
        }
    }
}
