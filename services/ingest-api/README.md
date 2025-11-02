
---

## 📗 INGEST API README — `services/ingest-api/README.md`

```markdown
# 🧩 Ingest API Service

This microservice is the **entry point** of the fraud detection system.  
It receives transaction data from clients and publishes them to Kafka for downstream processing.

---

## ⚙️ Tech Stack

| Component | Technology |
|------------|-------------|
| Language | Java 21 |
| Framework | Spring Boot 3.3 |
| Build Tool | Maven |
| Message Broker | Kafka |
| Cache / Idempotency | Redis |
| Port | 8081 (default) |

---

## 🚀 How It Works (Simplified)

1. A client sends a transaction via `POST /transactions`.
2. The app:
   - Validates fields (userId, amount, etc.)
   - Generates a unique `transactionId` if missing
   - Checks Redis to see if this ID was already processed (48-hour window)
   - If not seen before → publishes to Kafka topic `payments.events`
3. Returns `202 Accepted` + header `X-Transaction-Id`
4. If it’s a duplicate → returns `409 Conflict` with an error JSON.

---

## 🧠 Endpoints

### `POST /transactions`

**Example Request:**
```bash
curl -i -X POST http://localhost:8081/transactions \
 -H "Content-Type: application/json" \
 -d '{"userId":"u1","amount":10,"currency":"USD","merchantId":"m1","timestamp":"2025-11-01T12:00:00Z"}'