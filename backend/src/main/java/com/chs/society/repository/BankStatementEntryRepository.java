package com.chs.society.repository;

import com.chs.society.model.accounting.BankStatementEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface BankStatementEntryRepository extends JpaRepository<BankStatementEntry, UUID> {
    List<BankStatementEntry> findBySocietyId(UUID societyId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM BankStatementEntry e WHERE e.society.id = :societyId")
    void deleteBySocietyId(@org.springframework.data.repository.query.Param("societyId") UUID societyId);
}
