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
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SuperAdminService {

    private final SocietyRepository societyRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final com.chs.society.repository.SubscriptionPlanRepository subscriptionPlanRepository;
    private final PasswordEncoder passwordEncoder;
    private final jakarta.persistence.EntityManager entityManager;
    private final ObjectMapper objectMapper;

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
    private final com.chs.society.repository.MeetingRSVPRepository rsvpRepository;

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
            com.chs.society.repository.FinancialYearRepository financialYearRepository,
            com.chs.society.repository.MeetingRSVPRepository rsvpRepository,
            ObjectMapper objectMapper) {
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
        this.rsvpRepository = rsvpRepository;
        this.objectMapper = objectMapper;
    }

    public List<SocietyDto> getAllSocieties() {
        return societyRepository.findAll().stream().map(this::mapToSocietyDto).collect(Collectors.toList());
    }

    @Transactional
    public SocietyDto createSociety(CreateSocietyRequest request) {
        log.info("Creating new society: {}", request.getName());
        try {
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
            } else if (request.getSubscriptionPlan() != null) {
                String planName = request.getSubscriptionPlan().toUpperCase();
                plan = subscriptionPlanRepository.findAll().stream()
                        .filter(p -> p.getPlanType().name().contains(planName)
                                || p.getName().toUpperCase().contains(planName))
                        .findFirst()
                        .orElse(null);
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

            Society.SocietyBuilder society = Society.builder()
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
                    .memberLimit(request.getMemberLimit() != null ? request.getMemberLimit() : 50);

            if (request.getEnabledFeatures() != null) {
                try {
                    society.enabledFeatures(objectMapper.writeValueAsString(request.getEnabledFeatures()));
                } catch (Exception e) {
                    log.error("Failed to serialize features", e);
                }
            } else {
                List<String> defaults = List.of(
                        "FEAT_SOCIETY_STRUCT", "FEAT_COMMITTEE", "FEAT_RBAC", "FEAT_RESIDENTS",
                        "FEAT_BILLING", "FEAT_ACCOUNTING", "FEAT_DOCUMENTS", "FEAT_MEETINGS",
                        "FEAT_NOTIFICATIONS");
                try {
                    society.enabledFeatures(objectMapper.writeValueAsString(defaults));
                } catch (Exception e) {
                    log.error("Failed to serialize default features", e);
                }
            }

            Society savedSociety = societyRepository.save(java.util.Objects.requireNonNull(society.build()));

            // Also create a Society Admin User if email provided
            if (request.getAdminEmail() != null && !request.getAdminEmail().isEmpty()) {
                Role secretaryRole = roleRepository.findByName("ROLE_SOCIETY_ADMIN")
                        .orElseThrow(() -> new RuntimeException("Society Admin Role not found"));

                String password = (request.getAdminPassword() != null && !request.getAdminPassword().isEmpty())
                        ? request.getAdminPassword()
                        : "Temp@123";

                // Find or create admin user
                User adminUser = userRepository.findByEmail(request.getAdminEmail()).orElseGet(() -> User.builder()
                        .email(request.getAdminEmail())
                        .build());

                adminUser.setPhone(request.getAdminMobile());
                adminUser.setPassword(passwordEncoder.encode(password));
                adminUser.setFirstName("Admin");
                adminUser.setLastName(request.getName());
                adminUser.setRoles(Set.of(secretaryRole));
                adminUser.setSociety(savedSociety);
                adminUser.setActive(true);

                userRepository.save(java.util.Objects.requireNonNull(adminUser));
            }

            return mapToSocietyDto(savedSociety);
        } catch (Exception e) {
            log.error("Failed to create society: {}", e.getMessage(), e);
            throw new RuntimeException("Error saving society: " + e.getMessage());
        }
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

        if (request.getEnabledFeatures() != null) {
            try {
                society.setEnabledFeatures(objectMapper.writeValueAsString(request.getEnabledFeatures()));
            } catch (Exception e) {
                log.error("Failed to serialize features during edit", e);
            }
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

        String statusStr = status.toUpperCase();
        if (statusStr.equals("INACTIVE")) {
            society.setStatus(Society.SocietyStatus.INACTIVE);
        } else if (statusStr.equals("ACTIVE")) {
            society.setStatus(Society.SocietyStatus.ACTIVE);
        } else if (statusStr.equals("SUSPENDED")) {
            society.setStatus(Society.SocietyStatus.SUSPENDED);
        } else {
            society.setStatus(Society.SocietyStatus.PENDING);
        }

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
        entityManager.createQuery(
                "DELETE FROM AccountTransaction at WHERE at.journalEntry.id IN (SELECT j.id FROM JournalEntry j WHERE j.society.id = :id)")
                .setParameter("id", id).executeUpdate();
        entityManager.createQuery("DELETE FROM JournalEntry j WHERE j.society.id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createQuery("DELETE FROM BankStatementEntry e WHERE e.society.id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager
                .createQuery(
                        "DELETE FROM OtpToken t WHERE t.email IN (SELECT u.email FROM User u WHERE u.society.id = :id)")
                .setParameter("id", id).executeUpdate();

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
        rsvpRepository.deleteBySocietyId(id);
        committeeMemberRepository.deleteBySocietyId(id);
        shareCertificateRepository.deleteBySocietyId(id);

        entityManager.createQuery("DELETE FROM StaffRegister s WHERE s.society.id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createQuery("DELETE FROM ParkingRegister p WHERE p.society.id = :id")
                .setParameter("id", id).executeUpdate();

        // 4. Configuration & Master Data
        maintenanceConfigRepository.deleteBySocietyId(id);
        maintenanceHeadRepository.deleteBySocietyId(id);
        bankDetailRepository.deleteBySocietyId(id);
        ledgerRepository.deleteBySocietyId(id);

        entityManager.createQuery("UPDATE AccountGroup ag SET ag.parent = NULL WHERE ag.society.id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createQuery("DELETE FROM AccountGroup ag WHERE ag.society.id = :id")
                .setParameter("id", id).executeUpdate();

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
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Cleanup dependencies
        notificationRepository.deleteByUserId(userId);
        rsvpRepository.deleteByUserId(userId);
        committeeMemberRepository.deleteByUserId(userId);

        entityManager.createQuery("DELETE FROM OtpToken t WHERE t.email = :email")
                .setParameter("email", user.getEmail()).executeUpdate();

        // Important: If user is an admin of a society, we might want to clear that
        // society's adminEmail as well?
        // But for now, just delete the user.
        userRepository.delete(user);
    }

    @Transactional
    public void deleteDemoSocieties() {
        log.info("Starting cleanup of all societies with DEMO plan type.");
        List<Society> demoSocieties = societyRepository.findBySubscriptionPlanPlanType(
                com.chs.society.model.subscription.SubscriptionPlan.PlanType.DEMO);

        for (Society s : demoSocieties) {
            log.info("Deleting demo society: {} ({})", s.getName(), s.getId());
            deleteSociety(s.getId());
        }
    }

    @Transactional
    public void deleteSocietyByCode(String code) {
        log.info("Deleting society by code: {}", code);
        Society society = societyRepository.findBySocietyCode(code)
                .orElseThrow(() -> new RuntimeException("Society not found with code: " + code));
        deleteSociety(society.getId());
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
        dto.setApproved(society.isApproved());

        if (society.getEnabledFeatures() != null) {
            try {
                List<String> features = objectMapper.readValue(society.getEnabledFeatures(),
                        new TypeReference<List<String>>() {
                        });
                dto.setEnabledFeatures(features);
            } catch (Exception e) {
                log.error("Failed to deserialize features for society {}", society.getId(), e);
            }
        }

        return dto;
    }
}
