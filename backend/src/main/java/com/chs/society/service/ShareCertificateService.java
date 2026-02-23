package com.chs.society.service;

import com.chs.society.model.ShareCertificate;
import com.chs.society.model.Unit;
import com.chs.society.repository.ShareCertificateRepository;
import com.chs.society.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ShareCertificateService {

    private final ShareCertificateRepository certificateRepository;
    private final UnitRepository unitRepository;

    public ShareCertificateService(ShareCertificateRepository certificateRepository, UnitRepository unitRepository) {
        this.certificateRepository = certificateRepository;
        this.unitRepository = unitRepository;
    }

    public List<ShareCertificate> getCertificatesBySociety(UUID societyId) {
        return certificateRepository.findBySocietyId(societyId);
    }

    @Transactional
    public ShareCertificate generateForUnit(UUID unitId, String memberName, Integer startNo, Integer count) {
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new RuntimeException("Unit not found"));

        ShareCertificate certificate = ShareCertificate.builder()
                .society(unit.getWing().getSociety())
                .unit(unit)
                .certificateNumber("CERT-" + unit.getUnitNumber() + "-" + startNo)
                .memberName(memberName)
                .sharesFrom(startNo)
                .sharesTo(startNo + count - 1)
                .totalShares(count)
                .issueDate(LocalDate.now())
                .status("ISSUED")
                .build();

        return certificateRepository.save(certificate);
    }

    public byte[] generatePdf(UUID certificateId) {
        // Logic to generate high-quality PDF using iText/OpenPDF
        // This would involve loading a template and filling in the certificate details
        // For now, returning a dummy byte array
        return "Dummy PDF Content for Share Certificate".getBytes();
    }
}
