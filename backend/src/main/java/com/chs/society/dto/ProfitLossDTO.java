package com.chs.society.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class ProfitLossDTO {
    private Map<String, BigDecimal> income;
    private Map<String, BigDecimal> expenses;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netProfitOrLoss;
}
