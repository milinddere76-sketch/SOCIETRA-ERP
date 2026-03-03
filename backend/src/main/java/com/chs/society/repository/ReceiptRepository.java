package com.chs.society.repository;

import com.chs.society.model.accounting.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReceiptRepository extends JpaRepository<Receipt, UUID> {
    List<Receipt> findBySocietyIdOrderByDateDesc(UUID societyId);

    @org.springframework.data.jpa.repository.Modifying
    void deleteBySocietyId(UUID societyId);

    List<Receipt> findByMemberIdOrderByDateDesc(UUID memberId);
}
