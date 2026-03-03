package com.chs.society.repository;

import com.chs.society.model.accounting.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    List<Expense> findBySocietyIdOrderByDateDesc(UUID societyId);

    @Modifying
    void deleteBySocietyId(UUID societyId);
}
