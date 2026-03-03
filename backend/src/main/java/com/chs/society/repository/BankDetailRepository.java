package com.chs.society.repository;

import com.chs.society.model.accounting.BankDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface BankDetailRepository extends JpaRepository<BankDetail, UUID> {
    java.util.Optional<BankDetail> findBySocietyId(UUID societyId);

    @org.springframework.data.jpa.repository.Modifying
    void deleteBySocietyId(UUID societyId);
}
