package com.chs.society.dto;

import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorLogDto {
    private UUID id;
    private String name;
    private String phone;
    private String unit;
    private String type;
    private String time;
    private String exitTime;
    private String status;
}
