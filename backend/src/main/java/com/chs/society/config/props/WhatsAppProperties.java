package com.chs.society.config.props;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@org.springframework.context.annotation.Configuration
@ConfigurationProperties(prefix = "whatsapp.api")
public class WhatsAppProperties {
    private String url;
    private String key;
}
