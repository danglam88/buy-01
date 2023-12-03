package com.gritlab.config;

import com.gritlab.component.JwtAuthFilter;
import com.gritlab.component.CorsFilter;
import com.gritlab.component.ExceptionFilter;
import com.gritlab.component.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
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

    @Value("${spring.kafka.consumer.max-partition-fetch-bytes}")
    private String maxPartitionFetchBytes;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CorsFilter corsFilter,
            ExceptionFilter exceptionFilter,
            RateLimitFilter rateLimitFilter,
            JwtAuthFilter authFilter
    ) throws Exception {

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
}
