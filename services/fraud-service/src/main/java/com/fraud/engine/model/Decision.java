package com.fraud.engine.model;

import lombok.*;
import java.time.Instant;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Decision {
  private String transactionId;
  private String userId;
  private String decision;   // ALLOW | REVIEW | BLOCK
  private double score;      // 0–100 (rule score)
  private List<String> reasons;
  private long latencyMs;
  private Instant evaluatedAt;
}