package com.chs.society.repository;

import com.chs.society.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {
    List<Complaint> findBySocietyIdOrderByCreatedAtDesc(UUID societyId);

    List<Complaint> findByRaisedByIdOrderByCreatedAtDesc(UUID raisedById);

    @org.springframework.data.jpa.repository.Modifying
    void deleteBySocietyId(UUID societyId);
}
