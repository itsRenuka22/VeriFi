package com.fraud.engine.db;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name="fraud_decisions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DecisionEntity {
  @Id
  private String transactionId;

  private String userId;
  private String decision;
  private double score;

  @Column(length=1024)
  private String reasonsCsv;

  private long latencyMs;
  private Instant evaluatedAt;
}
