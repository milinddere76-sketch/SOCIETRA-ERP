package com.chs.society.controller;

import com.chs.society.dto.UserDto;
import com.chs.society.model.Role;
import com.chs.society.model.User;
import com.chs.society.repository.RoleRepository;
import com.chs.society.repository.UserRepository;
import com.chs.society.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/society/users")
@RequiredArgsConstructor
@Transactional
public class MemberController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UnitRepository unitRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserDto>> getSocietyUsers(Authentication authentication) {
        User admin = userRepository.findByEmail(authentication.getName()).orElseThrow();
        if (admin.getSociety() == null)
            return ResponseEntity.status(403).build();

        List<UserDto> users = userRepository.findBySocietyId(admin.getSociety().getId()).stream().map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(Authentication authentication, @RequestBody UserDto dto) {
        User admin = userRepository.findByEmail(authentication.getName()).orElseThrow();
        if (admin.getSociety() == null)
            return ResponseEntity.status(403).build();

        String phone = dto.getPhone() != null && dto.getPhone().trim().isEmpty() ? null : dto.getPhone();
        String email = dto.getEmail() != null && dto.getEmail().trim().isEmpty() ? null : dto.getEmail();

        User user = User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(email)
                .phone(phone)
                .memberId(dto.getMemberId())
                .address(dto.getAddress())
                .profilePhoto(dto.getProfilePhoto())
                .password(passwordEncoder.encode(
                        dto.getPassword() != null && !dto.getPassword().isEmpty() ? dto.getPassword() : "Welcome@123"))
                .society(admin.getSociety())
                .isActive(true)
                .build();

        Role memberRole = roleRepository.findByName("ROLE_MEMBER").orElseGet(() -> {
            Role r = new Role();
            r.setName("ROLE_MEMBER");
            return roleRepository.save(r);
        });
        user.setRoles(Set.of(memberRole));

        userRepository.save(user);
        return ResponseEntity.ok(mapToDto(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable UUID id, @RequestBody UserDto dto) {
        User user = userRepository.findById(java.util.Objects.requireNonNull(id)).orElseThrow();

        String phone = dto.getPhone() != null && dto.getPhone().trim().isEmpty() ? null : dto.getPhone();
        String email = dto.getEmail() != null && dto.getEmail().trim().isEmpty() ? null : dto.getEmail();

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(email);
        user.setPhone(phone);
        user.setMemberId(dto.getMemberId());
        user.setAddress(dto.getAddress());
        user.setProfilePhoto(dto.getProfilePhoto());
        user.setActive(dto.isActive());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(mapToDto(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userRepository.deleteById(java.util.Objects.requireNonNull(id));
        return ResponseEntity.ok().build();
    }

    private UserDto mapToDto(User u) {
        UserDto d = new UserDto();
        d.setId(u.getId());
        d.setFirstName(u.getFirstName());
        d.setLastName(u.getLastName());
        d.setEmail(u.getEmail());
        d.setPhone(u.getPhone());
        d.setMemberId(u.getMemberId());
        d.setAddress(u.getAddress());
        d.setProfilePhoto(u.getProfilePhoto());
        d.setActive(u.isActive());
        d.setRoles(u.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        List<String> units = unitRepository.findByOwnerId(u.getId()).stream()
                .map(com.chs.society.model.Unit::getUnitNumber)
                .collect(Collectors.toList());
        d.setOwnedUnits(units);
        return d;
    }
}
