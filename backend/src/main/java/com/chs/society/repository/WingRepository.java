package com.chs.society.repository;

import com.chs.society.model.Wing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WingRepository extends JpaRepository<Wing, UUID> {
    List<Wing> findBySocietyId(UUID societyId);

    @Modifying
    @Query("DELETE FROM Wing w WHERE w.society.id = :societyId")
    void deleteBySocietyId(@Param("societyId") UUID societyId);
}
