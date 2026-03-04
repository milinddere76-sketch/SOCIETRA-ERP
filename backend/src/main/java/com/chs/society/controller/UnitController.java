package com.chs.society.controller;

import com.chs.society.dto.UnitDto;
import com.chs.society.dto.WingDto;
import com.chs.society.service.UnitService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/units")
public class UnitController {

    private final UnitService unitService;

    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UnitDto>> getUnits(Authentication auth, @RequestParam(required = false) UUID societyId) {
        if (societyId != null) {
            // Check if user is Super Admin or belongs to this society
            return ResponseEntity.ok(unitService.getUnitsBySocietyId(societyId));
        }
        return ResponseEntity.ok(unitService.getUnitsBySociety(auth.getName()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_UNITS')")
    public ResponseEntity<UnitDto> addUnit(Authentication auth, @RequestBody UnitDto unitDto) {
        return ResponseEntity.ok(unitService.addUnit(auth.getName(), unitDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_UNITS')")
    public ResponseEntity<UnitDto> updateUnit(Authentication auth, @PathVariable UUID id,
            @RequestBody UnitDto unitDto) {
        return ResponseEntity.ok(unitService.updateUnit(auth.getName(), id, unitDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_UNITS')")
    public ResponseEntity<Void> deleteUnit(Authentication auth, @PathVariable UUID id) {
        unitService.deleteUnit(auth.getName(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/wings")
    @PreAuthorize("hasAuthority('MANAGE_UNITS')")
    public ResponseEntity<List<WingDto>> getWings(Authentication auth) {
        return ResponseEntity.ok(unitService.getWingsBySociety(auth.getName()));
    }

    @PostMapping("/wings")
    @PreAuthorize("hasAuthority('MANAGE_UNITS')")
    public ResponseEntity<WingDto> addWing(Authentication auth, @RequestBody WingDto wingDto) {
        return ResponseEntity.ok(unitService.addWing(auth.getName(), wingDto.getName()));
    }
}
