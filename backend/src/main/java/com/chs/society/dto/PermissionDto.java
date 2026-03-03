package com.chs.society.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class PermissionDto {
    private UUID id;
    private String name;
    private String description;
    private String category;
}
