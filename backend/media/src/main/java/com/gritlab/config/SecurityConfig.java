package com.gritlab.config;

import com.gritlab.component.JwtAuthFilter;
import com.gritlab.component.CorsFilter;
import com.gritlab.component.ExceptionFilter;
import com.gritlab.component.RateLimitFilter;
import com.gritlab.deserializer.BinaryDataDeserializer;
import com.gritlab.model.BinaryData;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;
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

    @Value("${spring.kafka.consumer.key-deserializer}")
    private String keyDeserializer;

    @Value("${spring.kafka.consumer.value-deserializer}")
    private String valueDeserializer;

    @Value("${spring.kafka.consumer.my-group-id}")
    private String myGroupId;

    @Value("${spring.kafka.consumer.binary-group-id}")
    private String binaryGroupId;

    @Autowired
    private CorsFilter corsFilter;

    @Autowired
    private JwtAuthFilter authFilter;

    @Autowired
    private ExceptionFilter exceptionFilter;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http.csrf(AbstractHttpConfigurer::disable)
                .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(exceptionFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers(HttpMethod.OPTIONS)
                                        .permitAll()
                                        .requestMatchers(HttpMethod.POST, "/media").hasAnyAuthority("SELLER")
                                        .requestMatchers(HttpMethod.DELETE, "/media").hasAnyAuthority("SELLER")
                                        .anyRequest()
                                        .authenticated())
                .build();
    }

    @Bean
    public NewTopic topic2() {
        return TopicBuilder.name("DELETE_PRODUCT")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic topic4() {
        return TopicBuilder.name("DEFAULT_PRODUCT")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic topic11() {
        return TopicBuilder.name("CHECK_PRODUCT_REQUEST")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic topic13() {
        return TopicBuilder.name("BINARY_DATA")
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

    @Bean ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, keyDeserializer);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, valueDeserializer);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, myGroupId);
        return new DefaultKafkaConsumerFactory<>(configProps);
    }

    @Bean
    public ConsumerFactory<String, BinaryData> binaryDataConsumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, keyDeserializer);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BinaryDataDeserializer.class.getName());
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, binaryGroupId);
        return new DefaultKafkaConsumerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, BinaryData> binaryDataKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, BinaryData> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(binaryDataConsumerFactory());
        return factory;
    }
}
