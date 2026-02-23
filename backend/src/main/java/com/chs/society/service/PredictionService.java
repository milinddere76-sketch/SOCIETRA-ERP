package com.chs.society.service;

import com.chs.society.dto.DefaulterPredictionDTO;
import com.chs.society.model.maintenance.MaintenanceBill;
import com.chs.society.repository.MaintenanceBillRepository;
import com.chs.society.repository.UnitRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PredictionService {

    private final MaintenanceBillRepository billRepository;
    private final UnitRepository unitRepository;

    public PredictionService(MaintenanceBillRepository billRepository, UnitRepository unitRepository) {
        this.billRepository = billRepository;
        this.unitRepository = unitRepository;
    }

    public List<DefaulterPredictionDTO> getDefaulterPredictions(UUID societyId) {
        return unitRepository.findBySocietyId(societyId).stream()
                .map(unit -> {
                    // Simulated heuristic-based AI logic
                    // In a real scenario, this would call a Python/ML service or use a loaded ML model
                    List<MaintenanceBill> history = billRepository.findTop12ByUnitIdOrderByCreatedAtDesc(unit.getId());
                    
                    double riskScore = calculateHeuristicRisk(history);
                    String riskLevel = determineRiskLevel(riskScore);
                    List<String> factors = identifyRiskFactors(history, riskScore);

                    return DefaulterPredictionDTO.builder()
                            .unitId(unit.getId())
                            .unitNumber(unit.getUnitNumber())
                            .memberName(unit.getOwnerName())
                            .currentDues(billRepository.sumUnpaidAmountByUnitId(unit.getId()).orElse(BigDecimal.ZERO))
                            .riskScore(riskScore)
                            .riskLevel(riskLevel)
                            .riskFactors(factors)
                            .recommendedAction(getRecommendation(riskLevel))
                            .build();
                })
                .filter(p -> p.getRiskScore() > 0.3) // Only show units with some risk
                .sorted((a, b) -> Double.compare(b.getRiskScore(), a.getRiskScore()))
                .collect(Collectors.toList());
    }

    private double calculateHeuristicRisk(List<MaintenanceBill> history) {
        if (history.isEmpty()) return 0.0;
        
        long unpaidCount = history.stream().filter(b -> b.getStatus() != MaintenanceBill.BillStatus.PAID).count();
        double trendFactor = 0;
        
        // Simple trend: if last 3 are unpaid, risk spikes
        if (history.size() >= 3 && history.subList(0, 3).stream().allMatch(b -> b.getStatus() != MaintenanceBill.BillStatus.PAID)) {
            trendFactor = 0.4;
        }

        return Math.min(1.0, (unpaidCount / 12.0) + trendFactor);
    }

    private String determineRiskLevel(double score) {
        if (score > 0.8) return "CRITICAL";
        if (score > 0.5) return "HIGH";
        if (score > 0.3) return "MEDIUM";
        return "LOW";
    }

    private List<String> identifyRiskFactors(List<MaintenanceBill> history, double score) {
        List<String> factors = new ArrayList<>();
        if (score > 0.5) factors.add("History of irregular payments");
        if (history.size() >= 2 && history.get(0).getStatus() != MaintenanceBill.BillStatus.PAID) factors.add("Last 2 bills remain unpaid");
        return factors;
    }

    private String getRecommendation(String level) {
        return switch (level) {
            case "CRITICAL" -> "Initiate legal notice via Society Lawyer";
            case "HIGH" -> "Schedule committee meeting with member";
            case "MEDIUM" -> "Send automated WhatsApp reminder";
            default -> "Monitor next billing cycle";
        };
    }
}
