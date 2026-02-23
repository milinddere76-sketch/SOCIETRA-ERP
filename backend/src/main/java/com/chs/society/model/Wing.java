package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wing extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @Column(nullable = false)
    private String name;
}
