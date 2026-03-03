package com.chs.society.service;

import com.chs.society.model.Notification;
import com.chs.society.model.User;
import com.chs.society.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getNotificationsForUser(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void createNotification(User user, String title, String message, String type) {
        Notification n = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .build();
        notificationRepository.save(java.util.Objects.requireNonNull(n));
    }

    public void notifyAllMembers(com.chs.society.model.Society society, String title, String message, String type) {
        // Implementation would fetch all members of this society and create
        // notifications
        // For now, we interact with the repository directly if we had a findBySociety
        // method
    }

    public void sendEmail(String to, String subject, String body) {
        // Mock Email implementation
        System.out.println("Email sent to: " + to + " | Subject: " + subject);
    }

    public void sendBillAlertEmail(String email, String billNumber, String amount, String dueDate) {
        String message = String.format(
                "SOCIETRA: New bill generated. Bill No: %s, Amount: %s, Due Date: %s. Please pay via portal.",
                billNumber, amount, dueDate);
        sendEmail(email, "SOCIETRA: Maintenance Bill Generated", message);
    }

    public void sendPaymentConfirmationEmail(String email, String billNumber, String amount) {
        String message = String.format("SOCIETRA: Payment received for Bill No: %s. Amount: %s. Thank you!",
                billNumber, amount);
        sendEmail(email, "SOCIETRA: Payment Confirmation", message);
    }

    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(java.util.Objects.requireNonNull(notificationId)).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
