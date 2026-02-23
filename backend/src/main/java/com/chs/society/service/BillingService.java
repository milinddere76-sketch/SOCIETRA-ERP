package com.chs.society.service;

import com.chs.society.model.Society;
import com.chs.society.model.Unit;
import com.chs.society.model.maintenance.MaintenanceBill;
import com.chs.society.repository.MaintenanceBillRepository;
import com.chs.society.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class BillingService {

    private final MaintenanceBillRepository billRepository;
    private final UnitRepository unitRepository;

    public BillingService(MaintenanceBillRepository billRepository, UnitRepository unitRepository) {
        this.billRepository = billRepository;
        this.unitRepository = unitRepository;
    }

    @Transactional
    public void generateBillsForSociety(UUID societyId, LocalDate billDate) {
        List<Unit> units = unitRepository.findBySocietyId(societyId);
        
        for (Unit unit : units) {
            BigDecimal principal = calculatePrincipal(unit);
            BigDecimal pendingDues = calculatePendingDues(unit);
            BigDecimal interest = calculateInterest(pendingDues);

            MaintenanceBill bill = MaintenanceBill.builder()
                    .society(unit.getWing().getSociety())
                    .unit(unit)
                    .billNumber("BILL/" + unit.getUnitNumber() + "/" + billDate.getMonthValue())
                    .principalAmount(principal)
                    .previousDues(pendingDues)
                    .interestAmount(interest)
                    .totalAmount(principal.add(pendingDues).add(interest))
                    .dueDate(billDate.plusDays(15))
                    .status(MaintenanceBill.BillStatus.UNPAID)
                    .build();

            billRepository.save(bill);
        }
    }

    private BigDecimal calculatePrincipal(Unit unit) {
        // Logic based on sqft or fixed rate
        return new BigDecimal("2500"); // Placeholder
    }

    private BigDecimal calculatePendingDues(Unit unit) {
        return billRepository.sumUnpaidAmountByUnitId(unit.getId()).orElse(BigDecimal.ZERO);
    }

    private BigDecimal calculateInterest(BigDecimal pendingAmount) {
        if (pendingAmount.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        // 21% p.a. as per model bye-laws usually
        return pendingAmount.multiply(new BigDecimal("0.0175")); // Monthly interest
    }
}
