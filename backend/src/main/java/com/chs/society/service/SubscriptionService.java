package com.chs.society.service;

import com.chs.society.model.Society;
import com.chs.society.model.subscription.SubscriptionPlan;
import com.chs.society.repository.SocietyRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class SubscriptionService {

    private final SocietyRepository societyRepository;

    public SubscriptionService(SocietyRepository societyRepository) {
        this.societyRepository = societyRepository;
    }

    public void upgradePlan(UUID societyId, SubscriptionPlan newPlan) {
        Society society = societyRepository.findById(societyId)
                .orElseThrow(() -> new RuntimeException("Society not found"));

        society.setSubscriptionPlan(newPlan);
        society.setSubscriptionExpiry(LocalDate.now().plusYears(1));
        societyRepository.save(society);
    }

    public boolean isSubscriptionActive(Society society) {
        if (society.getSubscriptionExpiry() == null) return false;
        return society.getSubscriptionExpiry().isAfter(LocalDate.now());
    }

    public void checkAndLockSocieties() {
        // Daily cron job to deactivate societies with expired subscriptions
        societyRepository.findAllExpired(LocalDate.now()).forEach(s -> {
            s.setStatus(Society.SocietyStatus.SUSPENDED);
            societyRepository.save(s);
        });
    }
}
