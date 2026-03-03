package com.chs.society.repository;

import com.chs.society.model.maintenance.MaintenanceHead;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceHeadRepository extends JpaRepository<MaintenanceHead, UUID> {
    List<MaintenanceHead> findBySocietyId(UUID societyId);

    @org.springframework.data.jpa.repository.Modifying
    void deleteBySocietyId(UUID societyId);
}
