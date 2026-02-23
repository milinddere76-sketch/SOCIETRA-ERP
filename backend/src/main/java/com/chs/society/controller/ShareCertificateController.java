package com.chs.society.controller;

import com.chs.society.model.ShareCertificate;
import com.chs.society.service.ShareCertificateService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/certificates")
public class ShareCertificateController {

    private final ShareCertificateService certificateService;

    public ShareCertificateController(ShareCertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping("/society/{societyId}")
    public List<ShareCertificate> getCertificates(@PathVariable UUID societyId) {
        return certificateService.getCertificatesBySociety(societyId);
    }

    @PostMapping("/generate")
    public ShareCertificate generate(@RequestParam UUID unitId, 
                                     @RequestParam String memberName,
                                     @RequestParam Integer startNo,
                                     @RequestParam Integer count) {
        return certificateService.generateForUnit(unitId, memberName, startNo, count);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable UUID id) {
        byte[] pdf = certificateService.generatePdf(id);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=share_certificate.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
