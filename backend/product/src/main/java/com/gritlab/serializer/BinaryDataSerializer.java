package com.gritlab.serializer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.model.BinaryData;
import org.apache.kafka.common.errors.SerializationException;
import org.apache.kafka.common.serialization.Serializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;

public class BinaryDataSerializer implements Serializer<BinaryData> {

    private static final Logger log = LoggerFactory.getLogger(BinaryDataSerializer.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public byte[] serialize(String topic, BinaryData binaryData) {
        try {
            byte[] serializedData = objectMapper.writeValueAsBytes(binaryData);
            log.info("Serializing: Topic - {}, Data - {}", topic, objectMapper.writeValueAsString(binaryData)); // logs original data as JSON string
            log.debug("Serialized binary data: {}", Arrays.toString(serializedData)); // logs serialized byte array
            return serializedData;
        } catch (JsonProcessingException e) {
            log.error("Error serializing BinaryData", e);
            throw new SerializationException("Error serializing value", e);
        }
    }
}
