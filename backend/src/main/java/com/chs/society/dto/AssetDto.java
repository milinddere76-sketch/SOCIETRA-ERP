package com.chs.society.dto;

import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetDto {
    private UUID id;
    private String name;
    private String category;
    private String location;
    private String status;
    private String cost;
    private String lastService;
    private String nextService;
}
