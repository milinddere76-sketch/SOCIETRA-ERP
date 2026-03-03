package com.chs.society.service;

import com.chs.society.dto.CreateRoleRequest;
import com.chs.society.dto.PermissionDto;
import com.chs.society.dto.RoleDto;
import com.chs.society.model.Permission;
import com.chs.society.model.Role;
import com.chs.society.model.User;
import com.chs.society.repository.PermissionRepository;
import com.chs.society.repository.RoleRepository;
import com.chs.society.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoleManagementService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    public RoleManagementService(RoleRepository roleRepository, PermissionRepository permissionRepository,
            UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    public List<PermissionDto> getAllPermissions() {
        return permissionRepository.findAll().stream().map(p -> {
            PermissionDto dto = new PermissionDto();
            dto.setId(p.getId());
            dto.setName(p.getName());
            dto.setDescription(p.getDescription());
            dto.setCategory(p.getCategory());
            return dto;
        }).collect(Collectors.toList());
    }

    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public RoleDto createCustomRole(CreateRoleRequest request) {
        Set<Permission> permissions = request.getPermissions().stream()
                .map(name -> permissionRepository.findByName(name)
                        .orElseThrow(() -> new RuntimeException("Permission not found: " + name)))
                .collect(Collectors.toSet());

        String roleName = request.getName();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_CUSTOM_" + roleName.toUpperCase().replace(" ", "_");
        }

        Role role = Role.builder()
                .name(roleName)
                .description(request.getDescription())
                .permissions(permissions)
                .build();

        role = roleRepository.save(java.util.Objects.requireNonNull(role));
        return mapToDto(role);
    }

    @Transactional
    public void assignRoleToUser(UUID userId, String roleName) {
        User user = userRepository.findById(java.util.Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

        user.getRoles().add(role);
        userRepository.save(user);
    }

    private RoleDto mapToDto(Role role) {
        RoleDto dto = new RoleDto();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setPermissions(role.getPermissions().stream().map(Permission::getName).collect(Collectors.toSet()));
        return dto;
    }
}
