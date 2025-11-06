// package com.fraud.engine;

// import org.junit.jupiter.api.Test;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.boot.test.mock.mockito.MockBean;
// import org.springframework.kafka.core.KafkaTemplate;
// import org.springframework.test.context.ActiveProfiles;

// import com.fraud.engine.db.DecisionRepo;

// @SpringBootTest
// @ActiveProfiles("test")
// class FraudServiceApplicationTests {
// 	@MockBean(name = "decisionKafkaTemplate")
// 	KafkaTemplate<String, com.fraud.engine.model.Decision> decisionKafkaTemplate;
// 	@MockBean
// 	DecisionRepo decisionRepo;

// 	@Test
// 	void contextLoads() {
// 	}
// }
