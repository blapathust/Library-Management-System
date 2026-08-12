package vn.edu.hust.nmcnpm_20242_n3.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableMethodSecurity
public class CorsConfig {
    // CORS configuration is handled entirely within SecurityConfig.java
}
