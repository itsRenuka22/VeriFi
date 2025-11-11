package com.fraud.engine.web;

import com.fraud.engine.db.DecisionEntity;
import com.fraud.engine.db.DecisionRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/decisions")
@RequiredArgsConstructor
public class DecisionQueryController {

    private final DecisionRepo decisionRepo;

    /**
     * Get a decision by transaction ID
     * GET /api/decisions/{transactionId}
     */
    @GetMapping("/{transactionId}")
    public ResponseEntity<DecisionEntity> getDecisionByTransactionId(@PathVariable("transactionId") String transactionId) {
        Optional<DecisionEntity> decision = decisionRepo.findById(transactionId);
        return decision.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Query decisions by userId with pagination
     * GET /api/decisions?userId=charlie&page=0&size=20
     */
    @GetMapping
    public ResponseEntity<Page<DecisionEntity>> queryDecisions(
            @RequestParam(value = "userId", required = false) String userId,
            @RequestParam(value = "decision", required = false) String decision,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("evaluatedAt").descending());

        Page<DecisionEntity> results;

        // Query by userId
        if (userId != null && !userId.isBlank()) {
            results = decisionRepo.findByUserId(userId, pageRequest);
        }
        // Query by decision type
        else if (decision != null && !decision.isBlank()) {
            results = decisionRepo.findByDecision(decision.toUpperCase(), pageRequest);
        }
        // Query by date range
        else if (startDate != null && endDate != null) {
            results = decisionRepo.findByDateRange(startDate, endDate, pageRequest);
        }
        // Default: return all decisions
        else {
            results = decisionRepo.findAll(pageRequest);
        }

        return ResponseEntity.ok(results);
    }

    /**
     * Get decisions for a user within a date range
     * GET /api/decisions/user/{userId}/range?startDate=2025-11-01T00:00:00Z&endDate=2025-11-10T23:59:59Z
     */
    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<DecisionEntity>> getDecisionsByUserAndDateRange(
            @PathVariable("userId") String userId,
            @RequestParam(value = "startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(value = "endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        List<DecisionEntity> decisions = decisionRepo.findByUserIdAndDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(decisions);
    }

    /**
     * Get high-risk decisions (REVIEW or BLOCK)
     * GET /api/decisions/high-risk?page=0&size=50
     */
    @GetMapping("/high-risk")
    public ResponseEntity<Page<DecisionEntity>> getHighRiskDecisions(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<DecisionEntity> results = decisionRepo.findHighRiskDecisions(pageRequest);
        return ResponseEntity.ok(results);
    }

    /**
     * Get decision statistics for a user
     * GET /api/decisions/user/{userId}/stats
     */
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable("userId") String userId) {
        long totalDecisions = decisionRepo.countByUserId(userId);

        // You could add more stats here if needed
        Map<String, Object> stats = Map.of(
            "userId", userId,
            "totalDecisions", totalDecisions
        );

        return ResponseEntity.ok(stats);
    }

    /**
     * Health check endpoint
     * GET /api/decisions/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        long count = decisionRepo.count();
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "totalDecisions", String.valueOf(count)
        ));
    }
}
