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
    private final com.chs.society.repository.UserRepository userRepository;
    private final PdfService pdfService;

    public ShareCertificateService(ShareCertificateRepository certificateRepository,
            UnitRepository unitRepository,
            com.chs.society.repository.UserRepository userRepository,
            PdfService pdfService) {
        this.certificateRepository = certificateRepository;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.pdfService = pdfService;
    }

    public List<ShareCertificate> getCertificatesBySociety(UUID societyId) {
        return certificateRepository.findBySocietyId(societyId);
    }

    public List<ShareCertificate> getCertificatesBySocietyMember(String email) {
        com.chs.society.model.User user = userRepository.findByEmail(email).orElseThrow();
        if (user.getSociety() == null)
            return java.util.Collections.emptyList();
        return certificateRepository.findBySocietyId(user.getSociety().getId());
    }

    @Transactional
    public ShareCertificate generateForUnit(UUID unitId, String memberName, Integer startNo, Integer count,
            java.math.BigDecimal shareValue, String chairmanName, String secretaryName) {
        Unit unit = unitRepository.findById(java.util.Objects.requireNonNull(unitId))
                .orElseThrow(() -> new RuntimeException("Unit not found"));

        ShareCertificate certificate = ShareCertificate.builder()
                .society(unit.getWing().getSociety())
                .unit(unit)
                .certificateNumber("CERT-" + unit.getUnitNumber() + "-" + startNo)
                .memberName(memberName)
                .sharesFrom(startNo)
                .sharesTo(startNo + count - 1)
                .totalShares(count)
                .shareValue(shareValue)
                .chairmanName(chairmanName)
                .secretaryName(secretaryName)
                .issueDate(LocalDate.now())
                .status("ISSUED")
                .build();

        return certificateRepository.save(java.util.Objects.requireNonNull(certificate));
    }

    @Transactional(readOnly = true)
    public byte[] generatePdf(UUID certificateId) {
        ShareCertificate cert = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        return pdfService.generateShareCertificatePdf(cert);
    }

    @Transactional
    public ShareCertificate updateCertificate(UUID id, UUID unitId, String memberName, Integer startNo, Integer count,
            java.math.BigDecimal shareValue, String chairmanName, String secretaryName) {

        ShareCertificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        if (unitId != null && !certificate.getUnit().getId().equals(unitId)) {
            Unit unit = unitRepository.findById(unitId).orElseThrow(() -> new RuntimeException("Unit not found"));
            certificate.setUnit(unit);
        }

        certificate.setMemberName(memberName);
        certificate.setSharesFrom(startNo);
        certificate.setSharesTo(startNo + count - 1);
        certificate.setTotalShares(count);
        certificate.setShareValue(shareValue);
        certificate.setChairmanName(chairmanName);
        certificate.setSecretaryName(secretaryName);

        return certificateRepository.save(certificate);
    }

    @Transactional
    public void deleteCertificate(UUID id) {
        certificateRepository.deleteById(id);
    }

}
