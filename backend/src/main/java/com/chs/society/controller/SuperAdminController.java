package com.chs.society.controller;

import com.chs.society.dto.CreateSocietyRequest;
import com.chs.society.dto.SocietyDto;
import com.chs.society.dto.UserDto;
import com.chs.society.model.Role;
import com.chs.society.repository.UserRepository;
import com.chs.society.service.SuperAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/superadmin")
public class SuperAdminController {

    private final SuperAdminService superAdminService;
    private final UserRepository userRepository;

    public SuperAdminController(SuperAdminService superAdminService, UserRepository userRepository) {
        this.superAdminService = superAdminService;
        this.userRepository = userRepository;
    }

    // --- SOCIETIES CRUD ---
    @GetMapping("/societies")
    @PreAuthorize("hasAuthority('MANAGE_SOCIETY')")
    public ResponseEntity<List<SocietyDto>> getAllSocieties() {
        return ResponseEntity.ok(superAdminService.getAllSocieties());
    }

    @PostMapping("/societies")
    @PreAuthorize("hasAuthority('MANAGE_SOCIETY')")
    public ResponseEntity<SocietyDto> createSociety(@RequestBody CreateSocietyRequest request) {
        return ResponseEntity.ok(superAdminService.createSociety(request));
    }

    @PutMapping("/societies/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SOCIETY')")
    public ResponseEntity<SocietyDto> editSociety(@PathVariable UUID id, @RequestBody CreateSocietyRequest request) {
        return ResponseEntity.ok(superAdminService.editSociety(id, request));
    }

    @DeleteMapping("/societies/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SOCIETY')")
    public ResponseEntity<Void> deleteSociety(@PathVariable UUID id) {
        superAdminService.deleteSociety(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/societies/{id}/approve")
    @PreAuthorize("hasAuthority('MANAGE_SOCIETY')")
    public ResponseEntity<SocietyDto> approveSociety(@PathVariable UUID id) {
        return ResponseEntity.ok(superAdminService.approveSociety(id));
    }

    @PutMapping("/societies/{id}/status")
    @PreAuthorize("hasAuthority('MANAGE_SOCIETY')")
    public ResponseEntity<SocietyDto> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(superAdminService.updateSocietyStatus(id, status));
    }

    // --- USERS CRUD ---
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userRepository.findAll().stream().map(u -> {
            UserDto dto = new UserDto();
            dto.setId(u.getId());
            dto.setFirstName(u.getFirstName());
            dto.setLastName(u.getLastName());
            dto.setEmail(u.getEmail());
            dto.setPhone(u.getPhone());
            dto.setActive(u.isActive());
            dto.setSocietyName(u.getSociety() != null ? u.getSociety().getName() : "Global");
            dto.setRoles(u.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    public ResponseEntity<Void> editUser(@PathVariable UUID id, @RequestBody UserDto dto) {
        throw new RuntimeException("Super Admin is not allowed to edit users.");
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        superAdminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}
