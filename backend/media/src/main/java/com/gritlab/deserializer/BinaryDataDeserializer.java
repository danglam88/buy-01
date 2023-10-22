package com.gritlab.deserializer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.model.BinaryData;
import org.apache.kafka.common.errors.SerializationException;
import org.apache.kafka.common.serialization.Deserializer;

import java.io.IOException;

public class BinaryDataDeserializer implements Deserializer<BinaryData> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public BinaryData deserialize(String topic, byte[] data) {
        try {
            return objectMapper.readValue(data, BinaryData.class);
        } catch (IOException e) {
            throw new SerializationException("Error deserializing value", e);
        }
    }
}
