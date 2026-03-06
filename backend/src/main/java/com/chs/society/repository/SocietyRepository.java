package com.chs.society.repository;

import com.chs.society.model.Society;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SocietyRepository extends JpaRepository<Society, UUID> {

    java.util.Optional<Society> findBySocietyCode(String societyCode);

    boolean existsBySocietyCode(String societyCode);

    @Query("SELECT s FROM Society s WHERE s.subscriptionExpiry < :date")
    List<Society> findAllExpired(java.time.LocalDate date);

    List<Society> findBySubscriptionPlanPlanType(com.chs.society.model.subscription.SubscriptionPlan.PlanType planType);
}
