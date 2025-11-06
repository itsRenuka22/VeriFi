# Fraud Service

The `fraud-service` is the core decision engine of the real-time fraud detection system.
It listens to incoming transaction events from Kafka, evaluates them using rule-based and Redis-backed stateful checks, and produces Allow / Review / Block decisions that are published to another Kafka topic and persisted to PostgreSQL.

---

## ⚙️ Responsibilities

Function | Description
---|---
Consume Kafka events | Reads transaction messages from `payments.events`.
Evaluate fraud rules | Calculates a risk score (0–100) based on multiple static + dynamic rules.
Persist decisions | Writes every decision to Postgres for audit/history.
Publish to Kafka | Sends results to `fraud.decisions` for downstream systems.
Maintain state | Uses Redis for tracking recent activity (burst rate, devices, geo).
Error handling | Routes failed messages to `payments.dlq` (dead-letter queue).
Observability | Provides `/actuator/health` and detailed logs for monitoring.

---

## 🗂️ File-by-File Breakdown

### 🏁 `FraudServiceApplication.java`

Main Spring Boot entry point. Bootstraps the service and loads all configurations automatically.

### ⚙️ `config/`

- `KafkaConfig.java` — Defines Kafka producer beans used for publishing decisions. Configures JSON serialization for `Decision` objects and creates:
	- `ProducerFactory<String, Decision>`
	- `KafkaTemplate<String, Decision>` (named `decisionKafkaTemplate`)

- `KafkaErrorConfig.java` — Defines an error-handling strategy for message consumption. If a transaction fails to process or deserialize, it is automatically sent to the DLQ topic (`payments.dlq`). Uses `DefaultErrorHandler` and `DeadLetterPublishingRecoverer`. Reuses `decisionKafkaTemplate` for DLQ publishing.

### 🗃️ `db/`

- `DecisionEntity.java` — Maps the `fraud_decisions` table in PostgreSQL.
	- Columns:
		- `transaction_id` (`@Id`) — Unique transaction identifier
		- `user_id` — For grouping transactions
		- `decision` — ALLOW / REVIEW / BLOCK
		- `score` — Computed risk score (0–100)
		- `reasons_csv` — Comma-separated triggered rule reasons
		- `latency_ms` — Processing latency in milliseconds
		- `evaluated_at` — Decision timestamp

- `DecisionRepo.java` — Extends `JpaRepository<DecisionEntity, String>`. Provides CRUD access for the fraud decisions table. Used by `FraudProcessor` to save and query data.

### 🔁 `kafka/`

- `FraudProcessor.java` — The heart of the service — the Kafka consumer logic.
	- Annotated with `@KafkaListener(topics = "${app.topics.in}", groupId = "fraud-service")`.
	- Performs:
		- Reads each transaction from `payments.events`
		- Calls `RuleEngine.evaluate()` to score it
		- Uses `RedisState` to apply stateful rules (burst, new device, geo)
		- Publishes a `Decision` message to `fraud.decisions`
		- Saves to Postgres using `DecisionRepo`

### 🧮 `service/`

- `RuleEngine.java` — Stateless rule evaluator. Applies static checks (high amount, invalid amount, night-time transaction, currency sanity) and returns a numeric score (0–100) and triggered reasons.

### ⚡ `redis/`

- `RedisState.java` — Handles Redis-based dynamic rules:
	- Bursting: counts transactions in last 60s
	- New Device/IP: tracks first-seen values
	- Geo-Impossibility: stores last lat/lon and computes travel speed
	- Uses `StringRedisTemplate` for simple key-value operations.

### 📄 `model/`

- `Decision.java` — DTO for fraud decision messages. Contains `transactionId`, `userId`, `decision`, `score`, `reasons`, `latencyMs`, `evaluatedAt`. Serialized to JSON for publishing on Kafka.

### ⚙️ `resources/application.properties`

Example configuration (local dev):

```
server.port=8082
app.topics.in=payments.events
app.topics.out=fraud.decisions
app.topics.dlq=payments.dlq
spring.kafka.bootstrap-servers=localhost:9094
spring.data.redis.host=localhost
spring.data.redis.port=6380
spring.datasource.url=jdbc:postgresql://localhost:5543/fraud
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
management.endpoints.web.exposure.include=health,info
logging.level.com.fraud=DEBUG
```

---

## 🧠 Core Flow

Kafka: `payments.events` → `FraudProcessor`
	↓
	RuleEngine + RedisState
	↓
Decision created → save to DB + publish to `fraud.decisions`
	↓
(Errors → DLQ: `payments.dlq`)

---

## 🧪 Verifying Output

Consume decisions from Kafka:

```bash
docker exec -it fp-kafka /opt/kafka/bin/kafka-console-consumer.sh \
	--bootstrap-server localhost:9092 \
	--topic fraud.decisions \
	--from-beginning
```

Inspect latest decisions in Postgres:

```bash
docker exec -it fp-postgres psql -U postgres -d fraud \
	-c "SELECT transaction_id, decision, score, reasons_csv, evaluated_at FROM fraud_decisions ORDER BY evaluated_at DESC LIMIT 50;"
```

---

## Notes

- This README summarizes the core components and file responsibilities in `services/fraud-service`.
- If you want, I can also:
	- add a Postman collection for smoke tests,
	- add a small set of unit tests for `RuleEngine`, or
	- run a smoke test (start infra + post a test transaction) and show the observed decision.

