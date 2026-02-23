package com.chs.society.repository;

import com.chs.society.model.ShareCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShareCertificateRepository extends JpaRepository<ShareCertificate, UUID> {
    List<ShareCertificate> findBySocietyId(UUID societyId);
}
