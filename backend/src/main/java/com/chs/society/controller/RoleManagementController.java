package com.chs.society.controller;

import com.chs.society.dto.CreateRoleRequest;
import com.chs.society.dto.PermissionDto;
import com.chs.society.dto.RoleDto;
import com.chs.society.service.RoleManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
public class RoleManagementController {

    private final RoleManagementService roleManagementService;

    public RoleManagementController(RoleManagementService roleManagementService) {
        this.roleManagementService = roleManagementService;
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('CREATE_CUSTOM_ROLES')")
    public ResponseEntity<List<PermissionDto>> getAllPermissions() {
        return ResponseEntity.ok(roleManagementService.getAllPermissions());
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CREATE_CUSTOM_ROLES')")
    public ResponseEntity<List<RoleDto>> getAllRoles() {
        return ResponseEntity.ok(roleManagementService.getAllRoles());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_CUSTOM_ROLES')")
    public ResponseEntity<RoleDto> createCustomRole(@RequestBody CreateRoleRequest request) {
        return ResponseEntity.ok(roleManagementService.createCustomRole(request));
    }

    @PostMapping("/assign/{userId}/{roleName}")
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    public ResponseEntity<Void> assignRoleToUser(@PathVariable UUID userId, @PathVariable String roleName) {
        roleManagementService.assignRoleToUser(userId, roleName);
        return ResponseEntity.ok().build();
    }
}
