package com.chs.society.repository;

import com.chs.society.model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UnitRepository extends JpaRepository<Unit, UUID> {

    @Query("SELECT u FROM Unit u WHERE u.wing.society.id = :societyId")
    List<Unit> findBySocietyId(UUID societyId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Unit u WHERE u.wing.society.id = :societyId")
    void deleteBySocietyId(@org.springframework.data.repository.query.Param("societyId") UUID societyId);
}
