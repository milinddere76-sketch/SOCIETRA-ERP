package com.chs.society.controller;

import com.chs.society.dto.AssetDto;
import com.chs.society.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
public class AssetController {

    private final AssetService service;

    @GetMapping
    @PreAuthorize("hasRole('SOCIETY_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<AssetDto>> getAssets(Authentication auth) {
        return ResponseEntity.ok(service.getByUserEmail(auth.getName()));
    }

    @PostMapping
    @PreAuthorize("hasRole('SOCIETY_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<AssetDto> addAsset(Authentication auth, @RequestBody AssetDto dto) {
        return ResponseEntity.ok(service.saveAsset(auth.getName(), dto));
    }
}
