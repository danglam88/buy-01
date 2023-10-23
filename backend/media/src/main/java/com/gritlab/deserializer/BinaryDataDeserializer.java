package com.gritlab.deserializer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.model.BinaryData;
import org.apache.kafka.common.errors.SerializationException;
import org.apache.kafka.common.serialization.Deserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Arrays;

public class BinaryDataDeserializer implements Deserializer<BinaryData> {

    private static final Logger log = LoggerFactory.getLogger(BinaryDataDeserializer.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public BinaryData deserialize(String topic, byte[] data) {
        try {
            log.debug("Deserializing: Topic - {}, Byte Data - {}", topic, Arrays.toString(data)); // logs incoming byte array
            BinaryData result = objectMapper.readValue(data, BinaryData.class);
            log.info("Deserialized data: {}", result); // assumes BinaryData has a proper `toString()` method implemented
            return result;
        } catch (IOException e) {
            log.error("Error deserializing BinaryData", e);
            throw new SerializationException("Error deserializing value", e);
        }
    }
}
