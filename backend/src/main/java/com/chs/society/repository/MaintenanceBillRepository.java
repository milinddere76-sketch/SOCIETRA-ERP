package com.chs.society.repository;

import com.chs.society.model.maintenance.MaintenanceBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaintenanceBillRepository extends JpaRepository<MaintenanceBill, UUID> {

    @Query("SELECT SUM(b.totalAmount) FROM MaintenanceBill b WHERE b.unit.id = :unitId AND b.status != 'PAID'")
    Optional<BigDecimal> sumUnpaidAmountByUnitId(UUID unitId);

    List<MaintenanceBill> findTop12ByUnitIdOrderByCreatedAtDesc(UUID unitId);

    List<MaintenanceBill> findBySocietyIdOrderByCreatedAtDesc(UUID societyId);

    @org.springframework.data.jpa.repository.Modifying
    void deleteBySocietyId(UUID societyId);

    boolean existsByBillNumber(String billNumber);

    @Query("SELECT SUM(b.totalAmount) FROM MaintenanceBill b WHERE b.unit.owner.id = :userId AND b.status != 'PAID'")
    Optional<BigDecimal> sumUnpaidAmountByUserId(UUID userId);

    List<MaintenanceBill> findByUnitOwnerIdOrderByCreatedAtDesc(UUID userId);
}
