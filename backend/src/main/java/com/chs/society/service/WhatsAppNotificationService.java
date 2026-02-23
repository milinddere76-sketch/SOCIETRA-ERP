package com.chs.society.service;

import com.chs.society.model.maintenance.MaintenanceBill;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class WhatsAppNotificationService {

    @Value("${whatsapp.api.url:https://api.interakt.ai/v1/public/message/}")
    private String apiUrl;

    @Value("${whatsapp.api.key:DEFAULT_WHATSAPP_KEY}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendMaintenanceBill(MaintenanceBill bill) {
        // ... implementation
    }

    public void sendOtp(String phoneNumber, String otp) {
        String message = String.format(
            "Your SOCIETRA verification code is: *%s*. Valid for 5 minutes. Do not share this OTP.",
            otp
        );
        sendWhatsApp(phoneNumber, message);
    }

    private void sendWhatsApp(String phoneNumber, String message) {
        // Implementation for WhatsApp API (e.g., Interakt)
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Basic " + apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("fullPhoneNumber", phoneNumber);
            body.put("type", "Template"); // Most Indian APIs require template-based messaging
            body.put("template", Map.of(
                "name", "maintenance_bill_v1",
                "languageCode", "en",
                "bodyValues", new String[]{message}
            ));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            // restTemplate.postForEntity(apiUrl, request, String.class);
            
            log.info("WhatsApp notification triggered for: {} - Message: {}", phoneNumber, message);
        } catch (Exception e) {
            log.error("Failed to send WhatsApp notification: {}", e.getMessage());
        }
    }
}
