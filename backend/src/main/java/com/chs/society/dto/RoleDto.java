package com.chs.society.dto;

import lombok.Data;
import java.util.Set;
import java.util.UUID;

@Data
public class RoleDto {
    private UUID id;
    private String name;
    private String description;
    private Set<String> permissions;
}
