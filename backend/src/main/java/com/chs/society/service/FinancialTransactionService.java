package com.chs.society.service;

import com.chs.society.dto.FinancialTransactionDto;
import com.chs.society.model.FinancialTransaction;
import com.chs.society.model.FinancialYear;
import com.chs.society.model.User;
import com.chs.society.repository.FinancialTransactionRepository;
import com.chs.society.repository.FinancialYearRepository;
import com.chs.society.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinancialTransactionService {
    private final FinancialTransactionRepository repository;
    private final UserRepository userRepository;
    private final FinancialYearRepository yearRepository;

    public List<FinancialTransactionDto> getByUserEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSociety() == null)
            return List.of();
        return repository.findBySocietyIdOrderByIdDesc(user.getSociety().getId()).stream().map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FinancialTransactionDto saveTransaction(String email, FinancialTransactionDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSociety() == null)
            throw new RuntimeException("User has no society");

        // Rule: Society must have an active financial year
        FinancialYear activeYear = yearRepository.findCurrentActiveYearBySociety(user.getSociety().getId())
                .orElseThrow(() -> new RuntimeException(
                        "No active financial year found. Please set up a financial year in Society Settings before recording transactions."));

        LocalDate txnDate = dto.getDate() != null
                ? LocalDate.parse(dto.getDate(), DateTimeFormatter.ofPattern("dd MMM yyyy"))
                : LocalDate.now();

        // Rule: Transaction date must be within active financial year range
        if (txnDate.isBefore(activeYear.getStartDate()) || txnDate.isAfter(activeYear.getEndDate())) {
            throw new RuntimeException("Transaction date must be within the active financial year range: "
                    + activeYear.getStartDate() + " to " + activeYear.getEndDate());
        }

        FinancialTransaction entity = FinancialTransaction.builder()
                .society(user.getSociety())
                .description(dto.getDescription() != null ? dto.getDescription() : "")
                .type(dto.getType() != null ? dto.getType() : "Debit")
                .amount(dto.getAmount() != null ? dto.getAmount() : 0.0)
                .category(dto.getCategory() != null ? dto.getCategory() : "")
                .date(txnDate)
                .status(FinancialTransaction.TransactionStatus.PENDING)
                .createdBy(user)
                .payeePayerName(dto.getPayeePayerName())
                .paymentMode(dto.getPaymentMode())
                .transactionReference(dto.getTransactionReference())
                .voucherNumber(dto.getVoucherNumber() != null ? dto.getVoucherNumber()
                        : "V-" + System.currentTimeMillis() % 10000)
                .build();

        FinancialTransaction saved = repository.save(java.util.Objects.requireNonNull(entity));
        return mapToDto(saved);
    }

    @Transactional
    public FinancialTransactionDto updateTransaction(String email, UUID id, FinancialTransactionDto dto) {
        FinancialTransaction entity = repository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        User user = userRepository.findByEmail(email).orElseThrow();

        if (entity.getStatus() != FinancialTransaction.TransactionStatus.PENDING) {
            throw new RuntimeException("Only pending transactions can be edited");
        }
        if (!entity.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own transactions");
        }

        // Rule: Re-validate date if changed
        if (dto.getDate() != null) {
            FinancialYear activeYear = yearRepository.findCurrentActiveYearBySociety(user.getSociety().getId())
                    .orElseThrow(() -> new RuntimeException("No active financial year found."));
            LocalDate txnDate = LocalDate.parse(dto.getDate(), DateTimeFormatter.ofPattern("dd MMM yyyy"));
            if (txnDate.isBefore(activeYear.getStartDate()) || txnDate.isAfter(activeYear.getEndDate())) {
                throw new RuntimeException("Transaction date must be within the active financial year range.");
            }
            entity.setDate(txnDate);
        }

        entity.setDescription(dto.getDescription());
        entity.setAmount(dto.getAmount());
        entity.setType(dto.getType());
        entity.setCategory(dto.getCategory());
        entity.setPayeePayerName(dto.getPayeePayerName());
        entity.setPaymentMode(dto.getPaymentMode());
        entity.setTransactionReference(dto.getTransactionReference());

        return mapToDto(repository.save(entity));
    }

    @Transactional
    public void deleteTransaction(String email, UUID id) {
        FinancialTransaction entity = repository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        User user = userRepository.findByEmail(email).orElseThrow();

        if (entity.getStatus() != FinancialTransaction.TransactionStatus.PENDING) {
            throw new RuntimeException("Only pending transactions can be deleted");
        }
        if (!entity.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own transactions");
        }

        repository.delete(entity);
    }

    @Transactional
    public FinancialTransactionDto approveTransaction(String email, UUID id) {
        FinancialTransaction entity = repository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        User user = userRepository.findByEmail(email).orElseThrow();

        entity.setStatus(FinancialTransaction.TransactionStatus.APPROVED);
        entity.setApprovedBy(user);
        entity.setApprovalDate(LocalDate.now());

        return mapToDto(repository.save(entity));
    }

    @Transactional
    public FinancialTransactionDto rejectTransaction(String email, UUID id, String reason) {
        FinancialTransaction entity = repository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        User user = userRepository.findByEmail(email).orElseThrow();

        entity.setStatus(FinancialTransaction.TransactionStatus.REJECTED);
        entity.setApprovedBy(user);
        entity.setApprovalDate(LocalDate.now());
        entity.setRejectionReason(reason);

        return mapToDto(repository.save(entity));
    }

    private FinancialTransactionDto mapToDto(FinancialTransaction entity) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        return FinancialTransactionDto.builder()
                .id(entity.getId())
                .description(entity.getDescription())
                .type(entity.getType())
                .amount(entity.getAmount())
                .category(entity.getCategory())
                .date(entity.getDate() != null ? entity.getDate().format(formatter) : "")
                .status(entity.getStatus().name())
                .createdBy(entity.getCreatedBy() != null
                        ? (entity.getCreatedBy().getFirstName() + " " + entity.getCreatedBy().getLastName())
                        : "System")
                .approvedBy(entity.getApprovedBy() != null
                        ? (entity.getApprovedBy().getFirstName() + " " + entity.getApprovedBy().getLastName())
                        : "")
                .approvalDate(entity.getApprovalDate() != null ? entity.getApprovalDate().format(formatter) : "")
                .rejectionReason(entity.getRejectionReason())
                .payeePayerName(entity.getPayeePayerName())
                .paymentMode(entity.getPaymentMode())
                .transactionReference(entity.getTransactionReference())
                .voucherNumber(entity.getVoucherNumber())
                .build();
    }
}
