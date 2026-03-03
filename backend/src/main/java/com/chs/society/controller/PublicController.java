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

    public PublicController(SubscriptionPlanRepository subscriptionPlanRepository,
            SuperAdminService superAdminService) {
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.superAdminService = superAdminService;
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
