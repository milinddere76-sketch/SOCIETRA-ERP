package com.chs.society.service;

import com.chs.society.config.props.WhatsAppProperties;
import com.chs.society.model.maintenance.MaintenanceBill;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class WhatsAppNotificationService {

    private final WhatsAppProperties whatsappProperties;

    // private final RestTemplate restTemplate = new RestTemplate();

    public void sendMaintenanceBill(MaintenanceBill bill) {
        // ... implementation
    }

    public void sendOtp(String phoneNumber, String otp) {
        String message = String.format(
                "Your SOCIETRA verification code is: *%s*. Valid for 5 minutes. Do not share this OTP.",
                otp);
        sendWhatsApp(phoneNumber, message);
    }

    public void sendMeetingAlert(String phoneNumber, String meetingTitle, String date, String venue) {
        String message = String.format(
                "Notice: A new meeting *%s* has been scheduled for *%s* at *%s*. Please check your Dashboard for the agenda.",
                meetingTitle, date, venue);
        sendWhatsApp(phoneNumber, message);
    }

    public void sendBillAlert(String phone, String billNumber, String amount, String dueDate) {
        String message = String.format(
                "SOCIETRA: New Maintenance Bill *%s* generated.\nAmount: *₹%s*\nDue Date: *%s*\nPlease pay via the member portal.",
                billNumber, amount, dueDate);
        sendWhatsApp(phone, message);
    }

    public void sendPaymentConfirmation(String phone, String billNumber, String amount) {
        String message = String.format(
                "SOCIETRA: Payment Received! ✅\nBill No: *%s*\nAmount: *₹%s*\nThank you for your timely payment.",
                billNumber, amount);
        sendWhatsApp(phone, message);
    }

    private void sendWhatsApp(String phoneNumber, String message) {
        // Implementation for WhatsApp API (e.g., Interakt)
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Basic " + whatsappProperties.getKey());

            Map<String, Object> body = new HashMap<>();
            body.put("fullPhoneNumber", phoneNumber);
            body.put("type", "Template"); // Most Indian APIs require template-based messaging
            body.put("template", Map.of(
                    "name", "maintenance_bill_v1",
                    "languageCode", "en",
                    "bodyValues", new String[] { message }));

            // HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            // restTemplate.postForEntity(apiUrl, request, String.class);

            log.info("WhatsApp notification triggered for: {} - Message: {}", phoneNumber, message);
        } catch (Exception e) {
            log.error("Failed to send WhatsApp notification: {}", e.getMessage());
        }
    }
}
