package com.chs.society.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDto {
    private UUID id;
    private String subject;
    private String description;
    private String category;
    private String status;
    private String memberName;
    private UUID raisedById;
    private String unitName;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String resolutionNote;
    private String attachmentUrl;
}
