package com.fraud.engine.config;

import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.*;
import org.springframework.kafka.support.converter.StringJsonMessageConverter;
import org.springframework.kafka.support.serializer.SerializationUtils;

@Configuration
public class KafkaErrorConfig {

    @Value("${app.topics.dlq:payments.dlq}")
    private String dlqTopic;

    @Bean
    public DefaultErrorHandler errorHandler(
            @Qualifier("decisionKafkaTemplate") KafkaTemplate<?, ?> template) {

        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(
                template,
                (record, ex) -> new TopicPartition("payments.dlq", record.partition()));

        return new DefaultErrorHandler(recoverer);

    }
}
