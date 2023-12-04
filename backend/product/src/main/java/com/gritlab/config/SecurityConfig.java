package com.gritlab.config;

import com.gritlab.component.CorsFilter;
import com.gritlab.component.ExceptionFilter;
import com.gritlab.component.JwtAuthFilter;
import com.gritlab.component.RateLimitFilter;
import com.gritlab.model.BinaryData;
import com.gritlab.serializer.BinaryDataSerializer;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.producer.key-serializer}")
    private String keySerializer;

    @Value("${spring.kafka.producer.value-serializer}")
    private String valueSerializer;

    @Value("${spring.kafka.producer.max-request-size}")
    private String maxRequestSize;

    private static final String PRODUCTS = "/products";
    private static final String SELLER = "SELLER";

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthFilter jwtAuthFilter,
            CorsFilter corsFilter,
            ExceptionFilter exceptionFilter,
            RateLimitFilter rateLimitFilter) throws Exception {

        return http.csrf(AbstractHttpConfigurer::disable)
                .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(exceptionFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers(HttpMethod.OPTIONS)
                                        .permitAll()
                                        .requestMatchers(HttpMethod.POST, PRODUCTS).hasAnyAuthority(SELLER)
                                        .requestMatchers(HttpMethod.PUT, PRODUCTS).hasAnyAuthority(SELLER)
                                        .requestMatchers(HttpMethod.DELETE, PRODUCTS).hasAnyAuthority(SELLER)
                                        .anyRequest()
                                        .authenticated())
                .build();
    }

    @Bean
    public NewTopic deleteUser() {
        return TopicBuilder.name("DELETE_USER")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic deleteProduct() {
        return TopicBuilder.name("DELETE_PRODUCT")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic checkProductRequest() {
        return TopicBuilder.name("CHECK_PRODUCT_REQUEST")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic checkProductResponse() {
        return TopicBuilder.name("CHECK_PRODUCT_RESPONSE")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic binaryData() {
        return TopicBuilder.name("BINARY_DATA")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic productDataRequest() {
        return TopicBuilder.name("PRODUCT_DATA_REQUEST")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic productDataResponse() {
        return TopicBuilder.name("PRODUCT_DATA_RESPONSE")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, keySerializer);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, valueSerializer);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public ProducerFactory<String, BinaryData> binaryDataProducerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, keySerializer);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, BinaryDataSerializer.class.getName());
        configProps.put(ProducerConfig.MAX_REQUEST_SIZE_CONFIG, maxRequestSize);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    @Bean
    public KafkaTemplate<String, BinaryData> binaryDataKafkaTemplate() {
        return new KafkaTemplate<>(binaryDataProducerFactory());
    }
}
