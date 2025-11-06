# Common Models — Transaction Module

This module defines shared data models (POJOs) used across all microservices in the Fraud Detection system.

Path

```
libs/common-models/src/main/java/com/fraud/common/model/
```

Transaction.java

Overview

`Transaction.java` represents the canonical transaction event schema exchanged across microservices through Kafka.

It ensures a consistent data contract between producers (ingest-api) and consumers (fraud-service).

Fields

Field | Type | Description
---|---|---
transactionId | String | Unique ID for each transaction
userId | String | Associated user/customer ID
amount | double | Transaction amount
currency | String | ISO 3-letter code (e.g., USD, EUR)
merchantId | String | Identifier of the merchant
timestamp | String | ISO 8601 timestamp (e.g., 2025-11-05T10:00:00Z)
location | Location | Optional geo coordinates (lat, lon, city, country)
device | Device | Optional device info (id, ip, user agent)

Inner Classes

🗺️ Location

Field | Type | Description
---|---|---
lat | Double | Latitude
lon | Double | Longitude
city | String | City
country | String | Country

💻 Device

Field | Type | Description
---|---|---
id | String | Device identifier
ip | String | IP address
userAgent | String | Browser or app information

Purpose

- Shared between:
  - `ingest-api` → publishes `Transaction` to Kafka.
  - `fraud-service` → consumes the same model for evaluation.
- Prevents model drift and serialization mismatches.
- Easy to extend later (add new attributes like `channel`, `paymentMethod`, etc.) without breaking existing services.

Example JSON

```json
{
  "transactionId": "t1001",
  "userId": "alice123",
  "amount": 129.99,
  "currency": "USD",
  "merchantId": "m-42",
  "timestamp": "2025-11-01T10:00:00Z",
  "location": {
    "lat": 40.7,
    "lon": -73.9,
    "city": "NYC",
    "country": "US"
  },
  "device": {
    "id": "d-abc",
    "ip": "203.0.113.5",
    "userAgent": "iOS/17"
  }
}
```

Usage Example

Ingest API:

```java
kafkaTemplate.send("payments.events", transaction.getUserId(), transaction);
```

Fraud Service consumer example:

```java
@KafkaListener(topics = "payments.events", groupId = "fraud-service")
public void onEvent(Transaction tx) {
    double amount = tx.getAmount();
    // evaluate rules, call RuleEngine, etc.
}
```

Notes

- The canonical `Transaction` POJO is located at `libs/common-models/src/main/java/com/fraud/common/model/Transaction.java`.
- Keep this module backward-compatible: when adding new fields, prefer making them optional to avoid breaking older consumers.
