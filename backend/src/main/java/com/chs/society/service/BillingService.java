package com.chs.society.service;

import com.chs.society.model.Unit;
import com.chs.society.model.maintenance.MaintenanceBill;
import com.chs.society.model.maintenance.MaintenanceHead;
import com.chs.society.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.chs.society.dto.MaintenanceBillDto;

@Service
@lombok.RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class BillingService {

    private final MaintenanceBillRepository billRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final MaintenanceConfigRepository configRepository;
    private final MaintenanceHeadRepository headRepository;
    private final NotificationService notificationService;
    private final WhatsAppNotificationService whatsappService;
    private final PdfService pdfService;
    private final EmailService emailService;

    public List<MaintenanceBillDto> getBillsBySociety(String adminEmail) {
        com.chs.society.model.User user = userRepository.findByEmail(adminEmail).orElseThrow();
        if (user.getSociety() == null)
            return List.of();
        return billRepository.findBySocietyIdOrderByCreatedAtDesc(user.getSociety().getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public void generateBillsForSociety(String adminEmail, String billingMonth, LocalDate generationDate,
            LocalDate dueDate) {
        com.chs.society.model.User user = userRepository.findByEmail(adminEmail).orElseThrow();
        com.chs.society.model.Society society = user.getSociety();
        if (society == null)
            return;

        com.chs.society.model.maintenance.MaintenanceConfig config = configRepository.findBySocietyId(society.getId())
                .orElse(null);
        List<MaintenanceHead> customHeads = headRepository.findBySocietyId(society.getId());
        List<Unit> units = unitRepository.findBySocietyId(society.getId());

        for (Unit unit : units) {
            if (!unit.isOccupied())
                continue;

            String billNum = "BILL/" + unit.getUnitNumber() + "/" + billingMonth;
            if (billRepository.existsByBillNumber(billNum))
                continue;

            List<com.chs.society.model.maintenance.MaintenanceBillItem> billItems = new ArrayList<>();
            BigDecimal totalPrincipal = BigDecimal.ZERO;

            // 1. Add standard heads if config exists
            if (config != null) {
                totalPrincipal = totalPrincipal.add(addStandardHeads(config, unit, billItems));
            }

            // 2. Add custom heads
            for (MaintenanceHead head : customHeads) {
                BigDecimal amount = head.getAmount();
                if (head.getCalculationMethod() == MaintenanceHead.CalculationMethod.PER_SQFT) {
                    amount = amount.multiply(BigDecimal.valueOf(unit.getAreaSqft() != null ? unit.getAreaSqft() : 0.0));
                }
                billItems.add(com.chs.society.model.maintenance.MaintenanceBillItem.builder()
                        .name(head.getName())
                        .amount(amount)
                        .build());
                totalPrincipal = totalPrincipal.add(amount);
            }

            BigDecimal pendingDues = calculatePendingDues(unit);
            BigDecimal interest = calculateInterest(pendingDues);

            MaintenanceBill bill = MaintenanceBill.builder()
                    .society(society)
                    .unit(unit)
                    .billNumber(billNum)
                    .principalAmount(totalPrincipal)
                    .previousDues(pendingDues)
                    .interestAmount(interest)
                    .totalAmount(totalPrincipal.add(pendingDues).add(interest))
                    .dueDate(dueDate)
                    .status(MaintenanceBill.BillStatus.UNPAID)
                    .build();

            // Link items to bill and set the items list
            for (com.chs.society.model.maintenance.MaintenanceBillItem item : billItems) {
                item.setBill(bill);
            }
            bill.getItems().addAll(billItems);

            billRepository.save(bill);

            // Notify Member with PDF attachment
            if (unit.getOwner() != null) {
                com.chs.society.model.User owner = unit.getOwner();
                String amountStr = bill.getTotalAmount().toString();
                String dueStr = bill.getDueDate().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy"));
                String memberName = owner.getFirstName() + " " + owner.getLastName();

                notificationService.createNotification(owner, "Bill Generated",
                        "New maintenance bill " + bill.getBillNumber() + " generated for ₹" + amountStr, "BILLING");

                // Generate PDF and attach
                try {
                    byte[] billPdf = pdfService.generateMaintenanceBillPdf(bill);
                    if (owner.getEmail() != null) {
                        emailService.sendBillEmail(owner.getEmail(), memberName,
                                bill.getBillNumber(), amountStr, dueStr,
                                society.getName(), billPdf);
                    }
                    if (owner.getPhone() != null) {
                        whatsappService.sendBillAlert(owner.getPhone(),
                                bill.getBillNumber(), amountStr, dueStr);
                    }
                } catch (Exception ex) {
                    log.error("Failed to send bill notification for {}: {}", bill.getBillNumber(), ex.getMessage());
                }
            }
        }
    }

    private BigDecimal addStandardHeads(com.chs.society.model.maintenance.MaintenanceConfig config, Unit unit,
            List<com.chs.society.model.maintenance.MaintenanceBillItem> items) {
        BigDecimal total = BigDecimal.ZERO;

        total = total.add(addItemIfNonZero("Repairs & Maintenance", config.getRepairsAndMaintenance(),
                config.getCalculationMethod(), unit, items));
        total = total.add(
                addItemIfNonZero("Sinking Fund", config.getSinkingFund(), config.getCalculationMethod(), unit, items));
        total = total.add(addItemIfNonZero("Service Charges", config.getServiceCharges(), config.getCalculationMethod(),
                unit, items));
        total = total.add(addItemIfNonZero("Common Utility", config.getCommonUtilityCharges(),
                config.getCalculationMethod(), unit, items));
        total = total.add(addItemIfNonZero("Statutory Fees", config.getStatutoryFees(), config.getCalculationMethod(),
                unit, items));
        total = total.add(addItemIfNonZero("Parking Charges", config.getParkingCharges(), config.getCalculationMethod(),
                unit, items));
        total = total.add(addItemIfNonZero("Misc Charges", config.getMiscellaneousCharges(),
                config.getCalculationMethod(), unit, items));

        return total;
    }

    private BigDecimal addItemIfNonZero(String name, BigDecimal amount,
            com.chs.society.model.maintenance.MaintenanceConfig.CalculationMethod method, Unit unit,
            List<com.chs.society.model.maintenance.MaintenanceBillItem> items) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0)
            return BigDecimal.ZERO;

        BigDecimal actualAmount = amount;
        if (method == com.chs.society.model.maintenance.MaintenanceConfig.CalculationMethod.PER_SQFT) {
            actualAmount = amount.multiply(BigDecimal.valueOf(unit.getAreaSqft() != null ? unit.getAreaSqft() : 0.0));
        }

        items.add(com.chs.society.model.maintenance.MaintenanceBillItem.builder().name(name).amount(actualAmount)
                .build());
        return actualAmount;
    }

    private BigDecimal calculatePendingDues(Unit unit) {
        return billRepository.sumUnpaidAmountByUnitId(unit.getId()).orElse(BigDecimal.ZERO);
    }

    private BigDecimal calculateInterest(BigDecimal pendingAmount) {
        if (pendingAmount.compareTo(BigDecimal.ZERO) <= 0)
            return BigDecimal.ZERO;
        // 21% p.a. as per model bye-laws usually
        return pendingAmount.multiply(new BigDecimal("0.0175")); // Monthly interest
    }

    private MaintenanceBillDto mapToDto(MaintenanceBill entity) {
        return MaintenanceBillDto.builder()
                .id(entity.getId().toString())
                .invoiceNo(entity.getBillNumber())
                .unit(entity.getUnit().getWing().getName() + "-" + entity.getUnit().getUnitNumber())
                .billingMonth(entity.getBillNumber().split("/").length > 2 ? entity.getBillNumber().split("/")[2] : "")
                .amount(entity.getTotalAmount() != null ? entity.getTotalAmount().doubleValue() : 0.0)
                .items(entity.getItems().stream().map(item -> MaintenanceBillDto.MaintenanceBillItemDto.builder()
                        .name(item.getName())
                        .amount(item.getAmount().doubleValue())
                        .build()).collect(Collectors.toList()))
                .status(entity.getStatus() != null ? entity.getStatus().name() : "PENDING")
                .build();
    }
}
