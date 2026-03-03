package com.chs.society.repository;

import com.chs.society.model.maintenance.MaintenanceConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceConfigRepository extends JpaRepository<MaintenanceConfig, UUID> {
    java.util.Optional<MaintenanceConfig> findBySocietyId(UUID societyId);

    @org.springframework.data.jpa.repository.Modifying
    void deleteBySocietyId(UUID societyId);
}
