package com.chs.society.repository;

import com.chs.society.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @org.springframework.data.jpa.repository.Query("SELECT n FROM Notification n WHERE n.user.society.id = :societyId")
    List<Notification> findBySocietyId(@org.springframework.data.repository.query.Param("societyId") UUID societyId);

    @Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Notification n WHERE n.user.society.id = :societyId")
    void deleteBySocietyId(@org.springframework.data.repository.query.Param("societyId") UUID societyId);
}
