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
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final JwtUtils jwtUtils;
    private final WhatsAppNotificationService whatsappNotificationService;

    public LoginResponse initiateLogin(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        User user = userRepository.findByEmail(email).orElseThrow();
        String primaryRole = user.getRoles().stream().findFirst().map(r -> r.getName()).orElse("ROLE_MEMBER");

        // Bypass OTP for Super Admin
        if (primaryRole.equals("ROLE_SUPER_ADMIN")) {
            String token = jwtUtils.generateJwtToken(authentication);
            return LoginResponse.builder()
                    .token(token)
                    .requiresOtp(false)
                    .email(email)
                    .role(primaryRole)
                    .build();
        }

        // Generate 6-digit OTP for other roles
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));

        // MASTER OTP for user's requested number for testing parity
        if ("9967833175".equals(user.getPhone()) || "admin@societra.com".equals(email)) {
            otp = "123456";
        }

        // Save OTP
        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();
        otpTokenRepository.save(otpToken);

        // Send Notification (currently logs to console until API keys provided)
        if (user.getPhone() != null && !user.getPhone().isEmpty()) {
            whatsappNotificationService.sendOtp(user.getPhone(), otp);
        }

        return LoginResponse.builder()
                .token(null) // No token yet, requires OTP verification
                .requiresOtp(true)
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
