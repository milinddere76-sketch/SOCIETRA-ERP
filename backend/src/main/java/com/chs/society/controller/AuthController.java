package com.chs.society.controller;

import com.chs.society.service.AuthService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        AuthService.LoginResponse response = authService.initiateLogin(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        String token = authService.verifyOtpAndGenerateToken(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(new JwtResponse(token));
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class VerifyOtpRequest {
        private String email;
        private String otp;
    }

    @Data
    public static class JwtResponse {
        private String token;
        public JwtResponse(String token) { this.token = token; }
    }
}
