package com.fraud.engine.db;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionEntity {

    @Id
    private String transactionId;

    private String userId;
    private double amount;
    private String currency;
    private String merchantId;

    private Instant occurredAt;

    private String deviceId;
    private String deviceIp;
    private String deviceUserAgent;

    private Double latitude;
    private Double longitude;
    private String city;
    private String country;

    @Lob
    @Column(name = "raw_payload", columnDefinition = "TEXT")
    private String rawPayload;
}
