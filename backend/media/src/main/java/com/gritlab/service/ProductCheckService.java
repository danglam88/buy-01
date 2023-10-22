package com.gritlab.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.ConsumerFactory;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class ProductCheckService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory;
    private final ConcurrentHashMap<String, String> responseMap = new ConcurrentHashMap<>();

    @Autowired
    public ProductCheckService(
            KafkaTemplate<String, Object> kafkaTemplate,
            ConsumerFactory<String, String> consumerFactory,
            ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.kafkaListenerContainerFactory = kafkaListenerContainerFactory;
        this.kafkaListenerContainerFactory.setConsumerFactory(consumerFactory);
    }

    public void sendRequest(String correlationId, String payload) {
        System.out.println("Sending data :" + correlationId  + ", payload: "+  payload);
        kafkaTemplate.send("CHECK_PRODUCT_REQUEST", correlationId, payload);
    }

    @KafkaListener(topics = "CHECK_PRODUCT_RESPONSE")
    public void listen(ConsumerRecord<String, String> record) {
        String correlationId = record.key();
        String response = record.value();
        System.out.println("Receiving data :" + correlationId  + ", "+  response);
        responseMap.put(correlationId, response);
    }

    public String waitForResponse(String correlationId, long timeoutMillis) throws InterruptedException {
        String response = responseMap.get(correlationId);
        if (response == null) {
            Thread.sleep(timeoutMillis);
        }
        return responseMap.get(correlationId);
    }
}

