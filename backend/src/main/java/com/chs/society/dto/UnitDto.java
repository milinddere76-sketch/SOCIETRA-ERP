package com.chs.society.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnitDto {
    private UUID id;
    private String unitNumber;
    private String unitType;
    private Double areaSqft;
    private String ownerName;
    private boolean occupied;
    private UUID wingId;
    private String wingName;
}
