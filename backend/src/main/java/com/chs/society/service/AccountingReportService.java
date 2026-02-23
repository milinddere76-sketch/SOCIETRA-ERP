package com.chs.society.service;

import com.chs.society.dto.BalanceSheetDTO;
import com.chs.society.model.accounting.AccountGroup;
import com.chs.society.model.accounting.Ledger;
import com.chs.society.repository.LedgerRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AccountingReportService {

    private final LedgerRepository ledgerRepository;

    public AccountingReportService(LedgerRepository ledgerRepository) {
        this.ledgerRepository = ledgerRepository;
    }

    public BalanceSheetDTO generateBalanceSheet(UUID societyId) {
        List<Ledger> allLedgers = ledgerRepository.findBySocietyId(societyId);

        Map<String, BigDecimal> assets = new HashMap<>();
        Map<String, BigDecimal> liabilities = new HashMap<>();
        
        final BigDecimal[] totalAssets = {BigDecimal.ZERO};
        final BigDecimal[] totalLiabilities = {BigDecimal.ZERO};

        allLedgers.forEach(ledger -> {
            BigDecimal balance = ledger.getCurrentBalance();
            if (ledger.getGroup().getType() == AccountGroup.AccountType.ASSET) {
                assets.put(ledger.getName(), balance);
                totalAssets[0] = totalAssets[0].add(balance);
            } else if (ledger.getGroup().getType() == AccountGroup.AccountType.LIABILITY) {
                liabilities.put(ledger.getName(), balance);
                totalLiabilities[0] = totalLiabilities[0].add(balance);
            }
        });

        // Surplus/Deficit is calculated from (Income - Expense) and usually added to Liabilities as 'General Fund'
        // For simplicity in this DTO, we'll calculate the gap.
        BigDecimal surplus = totalAssets[0].subtract(totalLiabilities[0]);

        return BalanceSheetDTO.builder()
                .assets(assets)
                .liabilities(liabilities)
                .totalAssets(totalAssets[0])
                .totalLiabilities(totalLiabilities[0])
                .surplusOrDeficit(surplus)
                .build();
    }
}
