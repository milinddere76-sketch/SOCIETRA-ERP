package com.chs.society.repository;

import com.chs.society.model.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, UUID> {
    List<FinancialTransaction> findBySocietyIdOrderByIdDesc(UUID societyId);

    List<FinancialTransaction> findBySocietyIdAndDateBetweenOrderByIdDesc(UUID societyId, java.time.LocalDate start,
            java.time.LocalDate end);

    List<FinancialTransaction> findBySocietyIdAndCategoryOrderByIdDesc(UUID societyId, String category);

    @org.springframework.data.jpa.repository.Modifying
    void deleteBySocietyId(UUID societyId);
}
