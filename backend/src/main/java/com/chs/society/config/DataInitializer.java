package com.chs.society.config;

import com.chs.society.model.Role;
import com.chs.society.model.User;
import com.chs.society.repository.RoleRepository;
import com.chs.society.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, 
                                     RoleRepository roleRepository, 
                                     PasswordEncoder passwordEncoder) {
        return args -> {
            // Create Roles if they don't exist
            Role adminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_SUPER_ADMIN").build()));
            
            Role secretaryRole = roleRepository.findByName("ROLE_SOCIETY_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_SOCIETY_ADMIN").build()));

            // Seed Super Admin
            if (userRepository.findByEmail("admin@societra.com").isEmpty()) {
                userRepository.save(User.builder()
                        .email("admin@societra.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .firstName("SOCIETRA")
                        .lastName("SuperAdmin")
                        .phone("+911234567890")
                        .roles(Set.of(adminRole))
                        .build());
            }

            // Seed Demo Society Admin (Requires OTP)
            if (userRepository.findByEmail("secretary@societra.com").isEmpty()) {
                userRepository.save(User.builder()
                        .email("secretary@societra.com")
                        .password(passwordEncoder.encode("Pass@123"))
                        .firstName("Amit")
                        .lastName("Sharma")
                        .phone("+919876543210")
                        .roles(Set.of(secretaryRole))
                        .build());
            }
        };
    }
}
