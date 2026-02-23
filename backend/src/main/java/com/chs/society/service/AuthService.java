package com.chs.society.service;

import com.chs.society.model.OtpToken;
import com.chs.society.model.User;
import com.chs.society.repository.OtpTokenRepository;
import com.chs.society.repository.UserRepository;
import com.chs.society.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final JwtUtils jwtUtils;
    private final WhatsAppNotificationService whatsAppService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, 
                       UserRepository userRepository, 
                       OtpTokenRepository otpTokenRepository, 
                       JwtUtils jwtUtils, 
                       WhatsAppNotificationService whatsAppService,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.otpTokenRepository = otpTokenRepository;
        this.jwtUtils = jwtUtils;
        this.whatsAppService = whatsAppService;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse initiateLogin(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        User user = userRepository.findByEmail(email).orElseThrow();

        // Check if user is Super Admin
        boolean isSuperAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_SUPER_ADMIN"));

        if (isSuperAdmin) {
            // Super Admin bypasses OTP
            String token = jwtUtils.generateJwtToken(authentication);
            return LoginResponse.builder()
                    .token(token)
                    .requiresOtp(false)
                    .build();
        }

        // Generate and send OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();
        otpTokenRepository.save(otpToken);

        whatsAppService.sendOtp(user.getPhone(), otp);

        return LoginResponse.builder()
                .requiresOtp(true)
                .email(email)
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

        // Fetch user again to generate token (context would be lost in stateless multi-call)
        User user = userRepository.findByEmail(email).orElseThrow();
        
        // This is a simplified bypass since we verified the creds in step 1
        // In a real app, you'd handle the Authentication object better
        return jwtUtils.generateJwtTokenForUser(user);
    }

    @lombok.Data
    @lombok.Builder
    public static class LoginResponse {
        private String token;
        private boolean requiresOtp;
        private String email;
    }
}
