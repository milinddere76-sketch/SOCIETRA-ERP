package com.chs.society.repository;

import com.chs.society.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    Optional<OtpToken> findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(String email);

    Optional<OtpToken> findByEmail(String email);

    @Modifying
    @Query("DELETE FROM OtpToken t WHERE t.email IN (SELECT u.email FROM User u WHERE u.society.id = :societyId)")
    void deleteBySocietyId(@Param("societyId") UUID societyId);
}
