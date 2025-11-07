package com.fraud.alerts.kafka;

import com.fraud.alerts.config.AlertsProperties;
import com.fraud.common.model.FraudDecision;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class DecisionListener {

    private final AlertsProperties properties;
    private final WebClient.Builder webClientBuilder;
    private final MeterRegistry meterRegistry;

    @Value("${app.alerts.slack.timeout:5s}")
    private Duration slackTimeout;

    private final Map<String, Instant> recentAlerts = new ConcurrentHashMap<>();
    private WebClient slackClient;
    private Counter sentCounter;
    private Counter skippedCounter;
    private Counter missingWebhookCounter;
    private Timer deliveryTimer;

    @PostConstruct
    void init() {
        this.slackClient = webClientBuilder.build();
        this.sentCounter = Counter.builder("alerts_sent_total")
            .description("Alerts delivered to Slack")
            .register(meterRegistry);
        this.skippedCounter = Counter.builder("alerts_skipped_total")
            .description("Alerts skipped due to filter or dedupe")
            .register(meterRegistry);
        this.missingWebhookCounter = Counter.builder("alerts_missing_webhook_total")
            .description("Alerts not sent because webhook not configured")
            .register(meterRegistry);
        this.deliveryTimer = Timer.builder("alerts_delivery_latency")
            .description("Time to invoke downstream alert delivery")
            .register(meterRegistry);
    }

    @KafkaListener(topics = "${app.topics.decisions:fraud.decisions}", groupId = "alerts-service")
    public void onDecision(FraudDecision decision, Acknowledgment ack) {
        try {
            if (!shouldAlert(decision)) {
                skippedCounter.increment();
                ack.acknowledge();
                return;
            }

            if (properties.getSlack().getWebhookUrl() == null || properties.getSlack().getWebhookUrl().isBlank()) {
                missingWebhookCounter.increment();
                log.warn("Slack webhook URL not configured; skipping alert for tx {}", decision.getTransactionId());
                ack.acknowledge();
                return;
            }

            Timer.Sample sample = Timer.start(meterRegistry);
            postToSlack(decision);
            sample.stop(deliveryTimer);
            sentCounter.increment();
            ack.acknowledge();
        } catch (Exception ex) {
            log.error("Failed to process alert for tx {}: {}", decision.getTransactionId(), ex.getMessage(), ex);
            throw ex;
        }
    }

    private boolean shouldAlert(FraudDecision decision) {
        Set<String> interestingDecisions = properties.getDecisions();
        if (interestingDecisions != null && !interestingDecisions.contains(decision.getDecision())) {
            return false;
        }
        Duration dedupeWindow = properties.getSlack().getDedupeWindow();
        if (dedupeWindow == null || dedupeWindow.isNegative() || dedupeWindow.isZero()) {
            return true;
        }
        Instant now = Instant.now();
        recentAlerts.entrySet().removeIf(entry -> entry.getValue().isBefore(now.minus(dedupeWindow.multipliedBy(5))));
        Instant last = recentAlerts.get(decision.getTransactionId());
        if (last != null && last.isAfter(now.minus(dedupeWindow))) {
            return false;
        }
        recentAlerts.put(decision.getTransactionId(), now);
        return true;
    }

    private void postToSlack(FraudDecision decision) {
        Map<String, Object> payload = Map.of(
            "text",
            "*Fraud Alert* (%s)\nUser: `%s`\nScore: %.1f\nReasons: %s\nEvaluated: %s".formatted(
                decision.getDecision(),
                decision.getUserId(),
                decision.getScore(),
                decision.getReasons(),
                decision.getEvaluatedAt())
        );

        slackClient.post()
            .uri(properties.getSlack().getWebhookUrl())
            .bodyValue(payload)
            .retrieve()
            .toBodilessEntity()
            .block(slackTimeout);
    }
}
