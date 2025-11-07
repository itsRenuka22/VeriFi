package com.fraud.common.model;

import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudDecision {
    private String transactionId;
    private String userId;
    private String decision; // ALLOW | REVIEW | BLOCK
    private double score;
    private List<String> reasons;
    private long latencyMs;
    private Instant evaluatedAt;

    private Double modelScore;
    private String modelVersion;
}
