package com.chs.society.repository;

import com.chs.society.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {
    List<Asset> findBySocietyIdOrderByIdDesc(UUID societyId);

    @org.springframework.data.jpa.repository.Modifying
    void deleteBySocietyId(UUID societyId);
}
