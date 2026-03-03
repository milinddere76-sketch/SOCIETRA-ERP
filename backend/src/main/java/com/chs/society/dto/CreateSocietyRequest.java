package com.chs.society.dto;

import lombok.Data;

@Data
public class CreateSocietyRequest {
    private String name;
    private String registrationNumber;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String adminEmail;
    private String adminMobile;
    private String adminPassword;
    private String country;
    private Integer memberLimit;
    private java.util.UUID planId;
}
