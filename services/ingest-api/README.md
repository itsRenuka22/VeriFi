# 🧩 Ingest API Service

This microservice is the **entry point** of the fraud detection system. It receives transaction data from clients and publishes them to Kafka for downstream processing.

---

## ⚙️ Tech Stack

| Component      | Technology      |
|---------------|----------------|
| Language      | Java 21        |
| Framework     | Spring Boot 3.3|
| Build Tool    | Maven          |
| Message Broker| Kafka          |
| Cache         | Redis          |
| Port          | 8081 (default) |

---

## 🏗️ Setup & Run

### Prerequisites
- Java 21+
- Maven
- Kafka, Redis, and Postgres running (see project root README)

### Build & Start
```bash
# From this directory
mvn clean package

# Run with environment variables
KAFKA_BOOTSTRAP_SERVERS=localhost:9094 SERVER_PORT=8081 mvn spring-boot:run
```

### Environment Variables
- `KAFKA_BOOTSTRAP_SERVERS` (default: `localhost:9094`)
- `SERVER_PORT` (default: `8081`)
- `REDIS_HOST`, `REDIS_PORT` (if not default)

---

## 🚀 How It Works
1. Client sends a transaction via `POST /transactions`.
2. App validates, generates `transactionId` if missing, checks Redis for idempotency, publishes to Kafka if new.
3. Returns `202 Accepted` + header `X-Transaction-Id`.
4. If duplicate, returns `409 Conflict` with error JSON.

---

## 🧠 API Endpoints

### `POST /transactions`

**Request Example:**
```bash
curl -i -X POST http://localhost:8081/transactions \
 -H "Content-Type: application/json" \
 -d '{"userId":"u1","amount":10,"currency":"USD","merchantId":"m1","timestamp":"2025-11-01T12:00:00Z"}'
```

**Success Response:**
- Status: `202 Accepted`
- Header: `X-Transaction-Id: <id>`

**Duplicate Response:**
- Status: `409 Conflict`
- Body:
```json
{
  "error": "Duplicate transaction",
  "transactionId": "<id>"
}
```

---

## 🛠️ Troubleshooting
- Ensure Kafka, Redis, and Postgres are running and accessible.
- Check environment variables for correct host/port settings.
- Review logs for connection errors or stack traces.
