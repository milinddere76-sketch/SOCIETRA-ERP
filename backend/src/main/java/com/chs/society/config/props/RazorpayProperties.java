package com.chs.society.config.props;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@org.springframework.context.annotation.Configuration
@ConfigurationProperties(prefix = "razorpay.key")
public class RazorpayProperties {
    private String id;
    private String secret;
}
