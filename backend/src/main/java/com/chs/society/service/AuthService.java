package com.chs.society.service;

import com.chs.society.model.OtpToken;
import com.chs.society.model.User;
import com.chs.society.repository.OtpTokenRepository;
import com.chs.society.repository.UserRepository;
import com.chs.society.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

@Service
@lombok.RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final JwtUtils jwtUtils;
    private final WhatsAppNotificationService whatsappNotificationService;

    public LoginResponse initiateLogin(String email, String password) {
        log.info("Attempting login for user: {}", email);
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.error("Authentication failed for user: {}. Error: {}", email, e.getMessage());
            throw e;
        }

        User user = userRepository.findByEmail(email).orElseThrow();
        String primaryRole = user.getRoles().stream().findFirst().map(r -> r.getName()).orElse("ROLE_MEMBER");
        log.info("User {} authenticated. Primary role: {}", email, primaryRole);

        log.info("Bypassing OTP for all users (Development/Bypass mode). User: {}", email);
        String token = jwtUtils.generateJwtToken(authentication);
        return LoginResponse.builder()
                .token(token)
                .requiresOtp(false)
                .email(email)
                .role(primaryRole)
                .build();
    }

    public String verifyOtpAndGenerateToken(String email, String otp) {
        OtpToken otpToken = otpTokenRepository.findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(email)
                .orElseThrow(() -> new RuntimeException("OTP not found or already used"));

        if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (!otpToken.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        // Fetch user again to generate token (context would be lost in stateless
        // multi-call)
        User user = userRepository.findByEmail(email).orElseThrow();

        // This is a simplified bypass since we verified the creds in step 1
        // In a real app, you'd handle the Authentication object better
        return jwtUtils.generateJwtTokenForUser(user);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("phone", user.getPhone());

        String primaryRole = user.getRoles().stream().findFirst().map(r -> r.getName()).orElse("ROLE_MEMBER");
        response.put("role", primaryRole);

        if (user.getSociety() != null) {
            Map<String, Object> societyData = new HashMap<>();
            societyData.put("name", user.getSociety().getName());
            societyData.put("address", user.getSociety().getAddress());
            societyData.put("registrationNumber", user.getSociety().getRegistrationNumber());
            societyData.put("adminEmail", user.getSociety().getAdminEmail());
            societyData.put("adminMobile", user.getSociety().getAdminMobile());
            societyData.put("city", user.getSociety().getCity());
            societyData.put("pincode", user.getSociety().getPincode());
            societyData.put("state", user.getSociety().getState());
            societyData.put("country", user.getSociety().getCountry());

            if (user.getSociety().getEnabledFeatures() != null) {
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    java.util.List<String> features = mapper.readValue(user.getSociety().getEnabledFeatures(),
                            new com.fasterxml.jackson.core.type.TypeReference<java.util.List<String>>() {
                            });
                    societyData.put("enabledFeatures", features);
                } catch (Exception e) {
                    societyData.put("enabledFeatures", java.util.Collections.emptyList());
                }
            } else {
                societyData.put("enabledFeatures", java.util.Collections.emptyList());
            }

            response.put("society", societyData);
        }

        return response;
    }

    @lombok.Data
    @lombok.Builder
    public static class LoginResponse {
        private String token;
        private boolean requiresOtp;
        private String email;
        private String role;
    }
}
