package com.chs.society.repository;

import com.chs.society.model.accounting.Ledger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LedgerRepository extends JpaRepository<Ledger, UUID> {
    List<Ledger> findBySocietyId(UUID societyId);
}
