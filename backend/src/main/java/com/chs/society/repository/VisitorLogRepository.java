package com.chs.society.repository;

import com.chs.society.model.VisitorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VisitorLogRepository extends JpaRepository<VisitorLog, UUID> {
    List<VisitorLog> findBySocietyIdOrderByEntryTimeDesc(UUID societyId);
    
    @Query("SELECT v FROM VisitorLog v WHERE v.society.id = :societyId AND v.exitTime IS NULL")
    List<VisitorLog> findCurrentVisitors(UUID societyId);
}
