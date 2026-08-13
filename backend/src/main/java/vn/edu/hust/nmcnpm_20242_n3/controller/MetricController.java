package vn.edu.hust.nmcnpm_20242_n3.controller;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hust.nmcnpm_20242_n3.service.MetricService;

@RestController
@RequestMapping("/api/metrics")
public class MetricController {
    private final MeterRegistry meterRegistry;
    private final MetricService metricService;

    public MetricController(MeterRegistry meterRegistry, MetricService metricService) {
        this.meterRegistry = meterRegistry;
        this.metricService = metricService;
    }

    @PostMapping("/count/visit")
    public ResponseEntity<String> viewUserPage() {
        meterRegistry.counter("user.page.view").increment();
        return ResponseEntity.ok("View recorded successfully");
    }

    @GetMapping("/count/books")
    public ResponseEntity<Long> getBookCount() {
        long bookCount = metricService.getBookCount();
        return ResponseEntity.ok(bookCount);
    }

    @GetMapping("/count/categories")
    public ResponseEntity<Long> getCategoryCount() {
        long categoryCount = metricService.getCategoryCount();
        return ResponseEntity.ok(categoryCount);
    }

    @GetMapping("/count/authors")
    public ResponseEntity<Long> getAuthorCount() {
        long authorCount = metricService.getAuthorCount();
        return ResponseEntity.ok(authorCount);
    }

    @GetMapping("/count/publishers")
    public ResponseEntity<Long> getPublisherCount() {
        long publisherCount = metricService.getPublisherCount();
        return ResponseEntity.ok(publisherCount);
    }

    @GetMapping("/count/users")
    public ResponseEntity<Long> getUserCount() {
        long userCount = metricService.getUserCount();
        return ResponseEntity.ok(userCount);
    }

    @GetMapping("/count/loans")
    public ResponseEntity<Long> getLoanCount() {
        long loanCount = metricService.getLoanCount();
        return ResponseEntity.ok(loanCount);
    }

    @GetMapping("/count/requests")
    public ResponseEntity<Long> getRequestCount() {
        long requestCount = metricService.getRequestCount();
        return ResponseEntity.ok(requestCount);
    }

    @GetMapping(value = "/visits", produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getVisits(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "-10mins") String from,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "now") String until,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String interval) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            // Determine graphite host based on environment
            String graphiteHost = System.getenv("STATSD_HOST");
            if (graphiteHost == null || graphiteHost.isEmpty()) {
                graphiteHost = "localhost";
            }
            
            // Port is 80 if inside docker (graphite), or 81 if on host (localhost mapped port)
            int graphitePort = "graphite".equals(graphiteHost) ? 80 : 81;
            
            // Use stats_counts which gives exact count per flush interval
            String targetView = "stats_counts.userPageView.statistic.count";
            String targetLogin = "stats_counts.userLogin.statistic.count";
            
            if (interval != null && !interval.trim().isEmpty()) {
                targetView = String.format("summarize(%s,'%s','sum')", targetView, interval.trim());
                targetLogin = String.format("summarize(%s,'%s','sum')", targetLogin, interval.trim());
            }
            
            String graphiteUrl = String.format("http://%s:%d/render?target=%s&target=%s&format=json&from=%s&until=%s", 
                graphiteHost, graphitePort, targetView, targetLogin, from, until);
                
            ResponseEntity<String> response = restTemplate.getForEntity(graphiteUrl, String.class);
            return ResponseEntity.ok().body(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching metrics: " + e.getMessage());
        }
    }
}
