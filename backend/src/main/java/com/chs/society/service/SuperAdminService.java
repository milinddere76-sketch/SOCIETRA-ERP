package com.chs.society.service;

import com.chs.society.dto.CreateSocietyRequest;
import com.chs.society.dto.SocietyDto;
import com.chs.society.model.Role;
import com.chs.society.model.Society;
import com.chs.society.model.User;
import com.chs.society.repository.RoleRepository;
import com.chs.society.repository.SocietyRepository;
import com.chs.society.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SuperAdminService {

    private final SocietyRepository societyRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final com.chs.society.repository.SubscriptionPlanRepository subscriptionPlanRepository;
    private final PasswordEncoder passwordEncoder;
    private final jakarta.persistence.EntityManager entityManager;

    private final com.chs.society.repository.MaintenanceBillRepository maintenanceBillRepository;
    private final com.chs.society.repository.ReceiptRepository receiptRepository;
    private final com.chs.society.repository.ExpenseRepository expenseRepository;
    private final com.chs.society.repository.FinancialTransactionRepository financialTransactionRepository;
    private final com.chs.society.repository.VisitorLogRepository visitorLogRepository;
    private final com.chs.society.repository.ComplaintRepository complaintRepository;
    private final com.chs.society.repository.AssetRepository assetRepository;
    private final com.chs.society.repository.MeetingMinutesRepository meetingMinutesRepository;
    private final com.chs.society.repository.NotificationRepository notificationRepository;
    private final com.chs.society.repository.CommitteeMemberRepository committeeMemberRepository;
    private final com.chs.society.repository.ShareCertificateRepository shareCertificateRepository;
    private final com.chs.society.repository.MaintenanceConfigRepository maintenanceConfigRepository;
    private final com.chs.society.repository.MaintenanceHeadRepository maintenanceHeadRepository;
    private final com.chs.society.repository.BankDetailRepository bankDetailRepository;
    private final com.chs.society.repository.LedgerRepository ledgerRepository;
    private final com.chs.society.repository.UnitRepository unitRepository;
    private final com.chs.society.repository.WingRepository wingRepository;
    private final com.chs.society.repository.FinancialYearRepository financialYearRepository;

    public SuperAdminService(SocietyRepository societyRepository, UserRepository userRepository,
            RoleRepository roleRepository,
            com.chs.society.repository.SubscriptionPlanRepository subscriptionPlanRepository,
            PasswordEncoder passwordEncoder,
            jakarta.persistence.EntityManager entityManager,
            com.chs.society.repository.MaintenanceBillRepository maintenanceBillRepository,
            com.chs.society.repository.ReceiptRepository receiptRepository,
            com.chs.society.repository.ExpenseRepository expenseRepository,
            com.chs.society.repository.FinancialTransactionRepository financialTransactionRepository,
            com.chs.society.repository.VisitorLogRepository visitorLogRepository,
            com.chs.society.repository.ComplaintRepository complaintRepository,
            com.chs.society.repository.AssetRepository assetRepository,
            com.chs.society.repository.MeetingMinutesRepository meetingMinutesRepository,
            com.chs.society.repository.NotificationRepository notificationRepository,
            com.chs.society.repository.CommitteeMemberRepository committeeMemberRepository,
            com.chs.society.repository.ShareCertificateRepository shareCertificateRepository,
            com.chs.society.repository.MaintenanceConfigRepository maintenanceConfigRepository,
            com.chs.society.repository.MaintenanceHeadRepository maintenanceHeadRepository,
            com.chs.society.repository.BankDetailRepository bankDetailRepository,
            com.chs.society.repository.LedgerRepository ledgerRepository,
            com.chs.society.repository.UnitRepository unitRepository,
            com.chs.society.repository.WingRepository wingRepository,
            com.chs.society.repository.FinancialYearRepository financialYearRepository) {
        this.societyRepository = societyRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.passwordEncoder = passwordEncoder;
        this.entityManager = entityManager;
        this.maintenanceBillRepository = maintenanceBillRepository;
        this.receiptRepository = receiptRepository;
        this.expenseRepository = expenseRepository;
        this.financialTransactionRepository = financialTransactionRepository;
        this.visitorLogRepository = visitorLogRepository;
        this.complaintRepository = complaintRepository;
        this.assetRepository = assetRepository;
        this.meetingMinutesRepository = meetingMinutesRepository;
        this.notificationRepository = notificationRepository;
        this.committeeMemberRepository = committeeMemberRepository;
        this.shareCertificateRepository = shareCertificateRepository;
        this.maintenanceConfigRepository = maintenanceConfigRepository;
        this.maintenanceHeadRepository = maintenanceHeadRepository;
        this.bankDetailRepository = bankDetailRepository;
        this.ledgerRepository = ledgerRepository;
        this.unitRepository = unitRepository;
        this.wingRepository = wingRepository;
        this.financialYearRepository = financialYearRepository;
    }

    public List<SocietyDto> getAllSocieties() {
        return societyRepository.findAll().stream().map(this::mapToSocietyDto).collect(Collectors.toList());
    }

    @Transactional
    public SocietyDto createSociety(CreateSocietyRequest request) {
        // Generate unique Society Code
        String baseCode = "SOC-" + (request.getCity() != null && request.getCity().length() >= 3
                ? request.getCity().substring(0, 3).toUpperCase()
                : "GEN");
        String societyCode;
        do {
            societyCode = baseCode + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (societyRepository.existsBySocietyCode(societyCode));

        com.chs.society.model.subscription.SubscriptionPlan plan = null;
        if (request.getPlanId() != null) {
            plan = subscriptionPlanRepository.findById(request.getPlanId()).orElse(null);
        }

        boolean autoApprove = false;
        java.time.LocalDate expiry = null;

        if (plan != null) {
            if (plan.getPlanType() == com.chs.society.model.subscription.SubscriptionPlan.PlanType.DEMO) {
                autoApprove = true;
            }
            if (plan.getValidityDays() != null) {
                expiry = java.time.LocalDate.now().plusDays(plan.getValidityDays());
            }
        }

        Society society = Society.builder()
                .name(request.getName())
                .registrationNumber(request.getRegistrationNumber())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .country(request.getCountry())
                .adminEmail(request.getAdminEmail())
                .adminMobile(request.getAdminMobile())
                .societyCode(societyCode)
                .status(autoApprove ? Society.SocietyStatus.ACTIVE : Society.SocietyStatus.PENDING)
                .isApproved(autoApprove)
                .subscriptionPlan(plan)
                .subscriptionExpiry(expiry)
                .memberLimit(request.getMemberLimit() != null ? request.getMemberLimit() : 50)
                .build();

        society = societyRepository.save(java.util.Objects.requireNonNull(society));

        // Also create a Society Admin User if email provided
        if (request.getAdminEmail() != null && !request.getAdminEmail().isEmpty()) {
            if (userRepository.findByEmail(request.getAdminEmail()).isEmpty()) {
                Role secretaryRole = roleRepository.findByName("ROLE_SOCIETY_ADMIN")
                        .orElseThrow(() -> new RuntimeException("Society Admin Role not found"));

                String password = (request.getAdminPassword() != null && !request.getAdminPassword().isEmpty())
                        ? request.getAdminPassword()
                        : "Temp@123";

                User adminUser = User.builder()
                        .email(request.getAdminEmail())
                        .phone(request.getAdminMobile())
                        .password(passwordEncoder.encode(password))
                        .firstName("Admin")
                        .lastName(request.getName())
                        .roles(Set.of(secretaryRole))
                        .society(society)
                        .isActive(true)
                        .build();
                userRepository.save(java.util.Objects.requireNonNull(adminUser));
            }
        }

        return mapToSocietyDto(society);
    }

    @Transactional
    public SocietyDto editSociety(UUID id, CreateSocietyRequest request) {
        Society society = societyRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Society not found"));
        society.setName(request.getName());
        society.setRegistrationNumber(request.getRegistrationNumber());
        society.setAddress(request.getAddress());
        society.setCity(request.getCity());
        society.setState(request.getState());
        society.setPincode(request.getPincode());
        society.setCountry(request.getCountry());
        society.setAdminEmail(request.getAdminEmail());
        society.setAdminMobile(request.getAdminMobile());
        if (request.getMemberLimit() != null) {
            society.setMemberLimit(request.getMemberLimit());
        }

        // Update user if needed
        userRepository.findByEmail(request.getAdminEmail()).ifPresent(user -> {
            user.setPhone(request.getAdminMobile());
            if (request.getAdminPassword() != null && !request.getAdminPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getAdminPassword()));
            }
            userRepository.save(user);
        });

        return mapToSocietyDto(societyRepository.save(society));
    }

    @Transactional
    public SocietyDto updateSocietyStatus(UUID id, String status) {
        Society society = societyRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Society not found"));
        society.setStatus(Society.SocietyStatus.valueOf(status.toUpperCase()));
        return mapToSocietyDto(societyRepository.save(society));
    }

    @Transactional
    public void deleteSociety(UUID id) {
        // Ensure entity exists
        if (!societyRepository.existsById(id)) {
            throw new RuntimeException("Society not found");
        }

        // Sequence deletion from deepest children up to parents (WIPE ALL RECORDS)

        // 1. Transactions & Bills Items
        entityManager.createQuery("DELETE FROM MaintenanceBillItem mi WHERE mi.bill.society.id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createQuery("DELETE FROM BankStatementEntry e WHERE e.society.id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager
                .createQuery(
                        "DELETE FROM OtpToken t WHERE t.email IN (SELECT u.email FROM User u WHERE u.society.id = :id)")
                .setParameter("id", id)
                .executeUpdate();

        // 2. Main Transactional Data
        maintenanceBillRepository.deleteBySocietyId(id);
        receiptRepository.deleteBySocietyId(id);
        expenseRepository.deleteBySocietyId(id);
        financialTransactionRepository.deleteBySocietyId(id);

        // 3. Operational Data
        visitorLogRepository.deleteBySocietyId(id);
        complaintRepository.deleteBySocietyId(id);
        assetRepository.deleteBySocietyId(id);
        meetingMinutesRepository.deleteBySocietyId(id);
        notificationRepository.deleteBySocietyId(id);
        committeeMemberRepository.deleteBySocietyId(id);
        shareCertificateRepository.deleteBySocietyId(id);

        // 4. Configuration & Master Data
        maintenanceConfigRepository.deleteBySocietyId(id);
        maintenanceHeadRepository.deleteBySocietyId(id);
        bankDetailRepository.deleteBySocietyId(id);
        ledgerRepository.deleteBySocietyId(id);

        // 5. Units & Wings
        unitRepository.deleteBySocietyId(id);
        wingRepository.deleteBySocietyId(id);

        // 6. Users & Financial Years
        financialYearRepository.deleteBySocietyId(id);
        userRepository.deleteBySocietyId(id);

        // 7. Finally the Society itself
        societyRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllSocieties() {
        List<Society> all = societyRepository.findAll();
        for (Society s : all) {
            deleteSociety(s.getId());
        }
    }

    @Transactional
    public SocietyDto approveSociety(UUID id) {
        Society society = societyRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Society not found"));
        society.setApproved(true);
        society.setStatus(Society.SocietyStatus.ACTIVE);
        return mapToSocietyDto(societyRepository.save(society));
    }

    private SocietyDto mapToSocietyDto(Society society) {
        SocietyDto dto = new SocietyDto();
        dto.setId(society.getId());
        dto.setName(society.getName());
        dto.setSocietyCode(society.getSocietyCode());
        dto.setRegistrationNumber(society.getRegistrationNumber());
        dto.setAddress(society.getAddress());
        dto.setCity(society.getCity());
        dto.setState(society.getState());
        dto.setPincode(society.getPincode());
        dto.setCountry(society.getCountry());
        dto.setAdminEmail(society.getAdminEmail());
        dto.setAdminMobile(society.getAdminMobile());
        dto.setStatus(society.getStatus().name());
        dto.setMemberLimit(society.getMemberLimit());
        return dto;
    }
}
