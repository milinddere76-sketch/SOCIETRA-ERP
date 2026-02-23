package com.chs.society.repository;

import com.chs.society.model.Society;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SocietyRepository extends JpaRepository<Society, UUID> {
    
    @Query("SELECT s FROM Society s WHERE s.subscriptionExpiry < :date")
    List<Society> findAllExpired(LocalDate date);
}
