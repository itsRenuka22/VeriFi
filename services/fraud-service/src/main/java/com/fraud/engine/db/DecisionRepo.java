package com.fraud.engine.db;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DecisionRepo extends JpaRepository<DecisionEntity, String> {}