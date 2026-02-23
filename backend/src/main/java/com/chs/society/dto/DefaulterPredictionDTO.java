package com.chs.society.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class DefaulterPredictionDTO {
    private UUID unitId;
    private String unitNumber;
    private String memberName;
    private BigDecimal currentDues;
    private double riskScore; // 0.0 to 1.0
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private List<String> riskFactors; // e.g., ["3 consecutive delayed payments", "Increasing trend in dues"]
    private String recommendedAction;
}
