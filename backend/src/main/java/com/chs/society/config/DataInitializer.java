package com.chs.society.config;

import com.chs.society.model.Permission;
import com.chs.society.model.Role;
import com.chs.society.model.User;
import com.chs.society.repository.PermissionRepository;
import com.chs.society.repository.RoleRepository;
import com.chs.society.repository.SocietyRepository;
import com.chs.society.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataInitializer {

        @Bean
        public CommandLineRunner initData(UserRepository userRepository,
                        RoleRepository roleRepository,
                        PermissionRepository permissionRepository,
                        SocietyRepository societyRepository,
                        com.chs.society.repository.SubscriptionPlanRepository subscriptionPlanRepository,
                        PasswordEncoder passwordEncoder) {
                return args -> {
                        // Seed Subscription Plans
                        seedSubscriptionPlans(subscriptionPlanRepository);

                        // Define core permissions
                        Permission viewDashboard = createPermissionIfNotFound(permissionRepository, "VIEW_DASHBOARD",
                                        "View general dashboard", "GENERAL");
                        Permission manageUsers = createPermissionIfNotFound(permissionRepository, "MANAGE_USERS",
                                        "Manage society members and admins", "ADMIN");
                        Permission manageSociety = createPermissionIfNotFound(permissionRepository, "MANAGE_SOCIETY",
                                        "Manage society details and settings", "ADMIN");
                        Permission manageFinance = createPermissionIfNotFound(permissionRepository, "MANAGE_FINANCE",
                                        "Manage accounting and billing", "FINANCE");
                        Permission manageGate = createPermissionIfNotFound(permissionRepository, "MANAGE_GATE",
                                        "Manage visitor logs and security", "SECURITY");
                        Permission manageAssets = createPermissionIfNotFound(permissionRepository, "MANAGE_ASSETS",
                                        "Manage society assets", "GENERAL");
                        Permission createCustomRoles = createPermissionIfNotFound(permissionRepository,
                                        "CREATE_CUSTOM_ROLES",
                                        "Create customized roles for society members", "ADMIN");
                        Permission manageUnits = createPermissionIfNotFound(permissionRepository, "MANAGE_UNITS",
                                        "Manage units and wings", "ADMIN");
                        Permission approveTransactions = createPermissionIfNotFound(permissionRepository,
                                        "APPROVE_TRANSACTIONS",
                                        "Approve or Reject financial transactions", "FINANCE");

                        Set<Permission> superAdminPermissions = Set.of(viewDashboard, manageUsers, manageSociety,
                                        manageFinance,
                                        manageGate, manageAssets, createCustomRoles, manageUnits, approveTransactions);
                        Set<Permission> societyAdminPermissions = Set.of(viewDashboard, manageUsers, manageFinance,
                                        manageGate,
                                        manageAssets, createCustomRoles, manageUnits, approveTransactions);
                        Set<Permission> memberPermissions = Set.of(viewDashboard);

                        // Create Roles if they don't exist
                        Role adminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                                        .orElse(Role.builder().name("ROLE_SUPER_ADMIN").build());
                        adminRole.setPermissions(superAdminPermissions);
                        roleRepository.save(java.util.Objects.requireNonNull(adminRole));

                        Role societyAdminRole = roleRepository.findByName("ROLE_SOCIETY_ADMIN")
                                        .orElse(Role.builder().name("ROLE_SOCIETY_ADMIN").build());
                        societyAdminRole.setPermissions(societyAdminPermissions);
                        roleRepository.save(java.util.Objects.requireNonNull(societyAdminRole));

                        Role secretaryRole = roleRepository.findByName("ROLE_SECRETARY")
                                        .orElse(Role.builder().name("ROLE_SECRETARY").build());
                        secretaryRole.setPermissions(societyAdminPermissions);
                        roleRepository.save(java.util.Objects.requireNonNull(secretaryRole));

                        Role chairmanRole = roleRepository.findByName("ROLE_CHAIRMAN")
                                        .orElse(Role.builder().name("ROLE_CHAIRMAN").build());
                        chairmanRole.setPermissions(societyAdminPermissions);
                        roleRepository.save(java.util.Objects.requireNonNull(chairmanRole));

                        Role memberRole = roleRepository.findByName("ROLE_MEMBER")
                                        .orElse(Role.builder().name("ROLE_MEMBER").build());
                        memberRole.setPermissions(memberPermissions);
                        roleRepository.save(java.util.Objects.requireNonNull(memberRole));

                        // Seed Super Admin
                        userRepository.findByEmail("admin@societra.com").ifPresentOrElse(
                                        admin -> {
                                                admin.setPhone("9967833175");
                                                admin.setPassword(passwordEncoder.encode("Admin@123"));
                                                admin.setRoles(Set.of(adminRole));
                                                admin.setIsActive(true);
                                                userRepository.save(admin);
                                        },
                                        () -> userRepository.save(java.util.Objects.requireNonNull(User.builder()
                                                        .email("admin@societra.com")
                                                        .password(passwordEncoder.encode("Admin@123"))
                                                        .firstName("SOCIETRA")
                                                        .lastName("SuperAdmin")
                                                        .phone("9967833175")
                                                        .roles(Set.of(adminRole))
                                                        .isActive(true)
                                                        .build())));
                };
        }

        private void seedSubscriptionPlans(com.chs.society.repository.SubscriptionPlanRepository repository) {
                if (repository.count() == 0) {
                        repository.save(com.chs.society.model.subscription.SubscriptionPlan.builder()
                                        .name("Demo Plan")
                                        .planType(com.chs.society.model.subscription.SubscriptionPlan.PlanType.DEMO)
                                        .monthlyPrice(java.math.BigDecimal.ZERO)
                                        .validityDays(7)
                                        .maxFlats(50)
                                        .features("{\"all\": true}")
                                        .build());

                        repository.save(com.chs.society.model.subscription.SubscriptionPlan.builder()
                                        .name("Monthly Professional")
                                        .planType(com.chs.society.model.subscription.SubscriptionPlan.PlanType.MONTHLY)
                                        .monthlyPrice(new java.math.BigDecimal("499"))
                                        .maxFlats(200)
                                        .features("{\"all\": true}")
                                        .build());

                        repository.save(com.chs.society.model.subscription.SubscriptionPlan.builder()
                                        .name("Yearly Enterprise")
                                        .planType(com.chs.society.model.subscription.SubscriptionPlan.PlanType.YEARLY)
                                        .monthlyPrice(new java.math.BigDecimal("4999"))
                                        .maxFlats(500)
                                        .features("{\"all\": true}")
                                        .build());
                }
        }

        private Permission createPermissionIfNotFound(PermissionRepository permissionRepository, String name,
                        String description, String category) {
                return permissionRepository.findByName(name)
                                .orElseGet(() -> permissionRepository
                                                .save(java.util.Objects.requireNonNull(Permission.builder()
                                                                .name(name)
                                                                .description(description)
                                                                .category(category)
                                                                .build())));
        }
}
