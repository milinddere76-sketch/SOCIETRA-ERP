package com.chs.society.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class BalanceSheetDTO {
    private Map<String, BigDecimal> assets;
    private Map<String, BigDecimal> liabilities;
    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal surplusOrDeficit;
    
    @Data
    @Builder
    public static class ReportItem {
        private String name;
        private BigDecimal balance;
    }
}
