package com.fraud.engine.db;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TransactionRepo extends JpaRepository<TransactionEntity, String> {

    @Query("SELECT COALESCE(SUM(t.amount),0) FROM TransactionEntity t")
    Double sumAmounts();

    TransactionEntity findFirstByOrderByOccurredAtDesc();

    List<TransactionEntity> findByOccurredAtAfterOrderByOccurredAtDesc(Instant since);
}
