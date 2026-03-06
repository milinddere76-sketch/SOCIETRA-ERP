package com.chs.society.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class SocietyDto {
    private UUID id;
    private String name;
    private String societyCode;
    private String registrationNumber;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private String adminEmail;
    private String adminMobile;
    private String status;
    private Integer memberLimit;
    private boolean approved;
    private java.util.List<String> enabledFeatures;
}
