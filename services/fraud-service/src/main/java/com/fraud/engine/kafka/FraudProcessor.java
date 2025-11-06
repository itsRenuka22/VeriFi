package com.fraud.engine.kafka;

import com.fraud.common.model.Transaction;
import com.fraud.engine.db.*;
import com.fraud.engine.model.Decision;
import com.fraud.engine.service.RuleEngine;
import com.fraud.engine.redis.RedisState;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@RequiredArgsConstructor
@Component
public class FraudProcessor {
  private final KafkaTemplate<String, Decision> decisionTemplate;
  private final DecisionRepo repo;
  private final RedisState redisState; // 👈 add this

  @Value("${app.topics.out}")
  private String outTopic;

  @KafkaListener(topics = "${app.topics.in}", groupId = "fraud-service")
  public void onEvent(Transaction tx) {
    long t0 = System.currentTimeMillis();
    if (repo.existsById(tx.getTransactionId()))
      return;

    var res = RuleEngine.evaluate(tx);
    var reasons = new java.util.ArrayList<>(res.reasons()); // editable
    double score = res.score();

    // ---- Redis-based checks ----
    long nowSec = Instant.now().getEpochSecond();
    redisState.recordTransactionTime(tx.getUserId(), nowSec);

    // A) Burst: more than N tx in last 60s
    long cnt60 = redisState.recentCount(tx.getUserId(), nowSec, 60);
    if (cnt60 >= 3) {
      score += 40;
      reasons.add("burst_60s");
    }

    // B) First-seen device/IP
    if (tx.getDevice() != null) {
      if (redisState.firstSeenDevice(tx.getUserId(), tx.getDevice().getId())) {
        score += 20;
        reasons.add("new_device");
      }
      if (redisState.firstSeenIp(tx.getUserId(), tx.getDevice().getIp())) {
        score += 15;
        reasons.add("new_ip");
      }
    }

    // C) Geo-impossible
    if (tx.getLocation() != null && tx.getLocation().getLat() != null && tx.getLocation().getLon() != null) {
      var last = redisState.getLastLoc(tx.getUserId());
      if (last != null) {
        double km = RedisState.haversineKm(
            last.lat(), last.lon(),
            tx.getLocation().getLat(), tx.getLocation().getLon());
        long dt = Math.max(1, nowSec - last.epochSec());
        double speed = km / (dt / 3600.0); // km/h
        if (speed > 900) { // >900 km/h is suspicious for 5 minute jumps etc.
          score += 50;
          reasons.add("geo_impossible");
        }
      }
      redisState.setLastLoc(
          tx.getUserId(), tx.getLocation().getLat(), tx.getLocation().getLon(), nowSec);
    }

    // Final decision
    String decisionStr = RuleEngine.toDecision(Math.min(score, 100));

    long latency = System.currentTimeMillis() - t0;
    var decision = Decision.builder()
        .transactionId(tx.getTransactionId())
        .userId(tx.getUserId())
        .decision(decisionStr)
        .score(Math.min(score, 100))
        .reasons(reasons)
        .latencyMs(latency)
        .evaluatedAt(Instant.now())
        .build();

    decisionTemplate.send(outTopic, tx.getUserId(), decision);

    var csv = new java.util.StringJoiner("|");
    reasons.forEach(csv::add);
    repo.save(DecisionEntity.builder()
        .transactionId(tx.getTransactionId())
        .userId(tx.getUserId())
        .decision(decisionStr)
        .score(Math.min(score, 100))
        .reasonsCsv(csv.toString())
        .latencyMs(latency)
        .evaluatedAt(decision.getEvaluatedAt())
        .build());
  }
}
