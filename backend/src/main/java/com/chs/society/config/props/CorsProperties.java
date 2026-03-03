package com.chs.society.config.props;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import java.util.List;

@Data
@org.springframework.context.annotation.Configuration
@ConfigurationProperties(prefix = "chs.cors")
public class CorsProperties {
    private List<String> allowedOrigins;
    private List<String> allowedMethods;
}
