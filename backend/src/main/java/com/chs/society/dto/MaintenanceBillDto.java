package com.chs.society.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class MaintenanceBillDto {
    private String id;
    private String invoiceNo;
    private String unit;
    private String billingMonth;
    private Double amount;
    private Double totalAmount;

    private List<MaintenanceBillItemDto> items;

    @Data
    @Builder
    public static class MaintenanceBillItemDto {
        private String name;
        private Double amount;
    }

    // Detailed charges
    private Double repairsAndMaintenance;
    private Double sinkingFund;
    private Double serviceCharges;
    private Double commonUtilityCharges;
    private Double statutoryFees;
    private Double parkingCharges;
    private Double miscellaneousCharges;
    private Double otherCharges;
    private Double previousDues;
    private Double interestAmount;

    private String dueDate;
    private String status;
}
