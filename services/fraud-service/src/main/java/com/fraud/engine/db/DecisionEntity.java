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

  @Convert(converter = com.fraud.engine.db.converter.StringListJsonConverter.class)
  @Column(name = "reasons_json", columnDefinition = "TEXT")
  private java.util.List<String> reasons;

  private long latencyMs;
  private Instant evaluatedAt;
}
