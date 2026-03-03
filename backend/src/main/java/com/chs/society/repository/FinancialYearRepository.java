package com.chs.society.repository;

import com.chs.society.model.FinancialYear;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FinancialYearRepository extends JpaRepository<FinancialYear, UUID> {
    List<FinancialYear> findBySocietyId(UUID societyId);

    @org.springframework.data.jpa.repository.Query("SELECT f FROM FinancialYear f WHERE f.society.id = :societyId AND f.active = true")
    Optional<FinancialYear> findCurrentActiveYearBySociety(
            @org.springframework.data.repository.query.Param("societyId") UUID societyId);

    @org.springframework.data.jpa.repository.Modifying
    void deleteBySocietyId(UUID societyId);
}
