package com.chs.society.repository;

import com.chs.society.model.VisitorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VisitorLogRepository extends JpaRepository<VisitorLog, UUID> {
    List<VisitorLog> findBySocietyIdOrderByEntryTimeDesc(UUID societyId);

    @org.springframework.data.jpa.repository.Modifying
    void deleteBySocietyId(UUID societyId);
}
