package com.chs.society.config.props;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@org.springframework.context.annotation.Configuration
@ConfigurationProperties(prefix = "chs.app")
public class AppProperties {
    private String jwtSecret;
    private long jwtExpirationMs;
}
