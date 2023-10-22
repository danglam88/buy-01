package com.gritlab.serializer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.model.BinaryData;
import org.apache.kafka.common.errors.SerializationException;
import org.apache.kafka.common.serialization.Serializer;

public class BinaryDataSerializer implements Serializer<BinaryData> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public byte[] serialize(String topic, BinaryData binaryData) {
        try {
            return objectMapper.writeValueAsBytes(binaryData);
        } catch (JsonProcessingException e) {
            throw new SerializationException("Error serializing value", e);
        }
    }
}
