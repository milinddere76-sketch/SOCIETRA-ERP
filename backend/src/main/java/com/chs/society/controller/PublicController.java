package com.chs.society.controller;

import com.chs.society.dto.CreateSocietyRequest;
import com.chs.society.dto.SocietyDto;
import com.chs.society.model.subscription.SubscriptionPlan;
import com.chs.society.repository.SubscriptionPlanRepository;
import com.chs.society.service.SuperAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SuperAdminService superAdminService;
    private final com.chs.society.repository.UserRepository userRepository;

    public PublicController(SubscriptionPlanRepository subscriptionPlanRepository,
            SuperAdminService superAdminService,
            com.chs.society.repository.UserRepository userRepository) {
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.superAdminService = superAdminService;
        this.userRepository = userRepository;
    }

    @GetMapping("/debug/users/{email}")
    public ResponseEntity<?> debugUser(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(java.util.Map.of(
                        "exists", true,
                        "isActive", user.isActive(),
                        "roles", user.getRoles().stream().map(r -> r.getName()).toList())))
                .orElse(ResponseEntity.ok(java.util.Map.of("exists", false)));
    }

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlan>> getPlans() {
        return ResponseEntity.ok(subscriptionPlanRepository.findAll());
    }

    @PostMapping("/societies/register")
    public ResponseEntity<SocietyDto> registerSociety(@RequestBody CreateSocietyRequest request) {
        return ResponseEntity.ok(superAdminService.createSociety(request));
    }
}
