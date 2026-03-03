package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "VIEW_DASHBOARD", "MANAGE_UNITS", "PROCESS_PAYMENTS"

    private String description;
    
    @Column(nullable = false)
    private String category; // e.g., "GENERAL", "ACCOUNTING", "GATE_SECURITY"
}
