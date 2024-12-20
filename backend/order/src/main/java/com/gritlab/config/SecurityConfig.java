package com.gritlab.config;

import com.gritlab.component.JwtAuthFilter;
import com.gritlab.component.CorsFilter;
import com.gritlab.component.ExceptionFilter;
import com.gritlab.component.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

    private static final String CLIENT = "CLIENT";
    private static final String SELLER = "SELLER";

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.producer.key-serializer}")
    private String keySerializer;

    @Value("${spring.kafka.producer.value-serializer}")
    private String valueSerializer;

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
                                        .requestMatchers(HttpMethod.GET, "/order/item").hasAnyAuthority(CLIENT)
                                        .requestMatchers(HttpMethod.GET, "/order/item/**").hasAnyAuthority(CLIENT)
                                        .requestMatchers(HttpMethod.POST, "/order/item/redo").hasAnyAuthority(CLIENT)
                                        .requestMatchers(HttpMethod.POST, "/order/item").hasAnyAuthority(CLIENT)
                                        .requestMatchers(HttpMethod.PUT, "/order/item/status/**").hasAnyAuthority(SELLER)
                                        .requestMatchers(HttpMethod.PUT, "/order/item/cancel/**").hasAnyAuthority(CLIENT)
                                        .requestMatchers(HttpMethod.PUT, "/order/item/**").hasAnyAuthority(CLIENT)
                                        .requestMatchers(HttpMethod.DELETE, "/order/item/**").hasAnyAuthority(CLIENT)
                                        .requestMatchers(HttpMethod.GET, "/order/seller").hasAnyAuthority(SELLER)
                                        .requestMatchers(HttpMethod.GET, "/order/client").hasAnyAuthority(CLIENT)
                                        .requestMatchers(HttpMethod.GET, "/order/**").hasAnyAuthority(CLIENT)
                                        .requestMatchers(HttpMethod.POST, "/order/redo").hasAnyAuthority(CLIENT)
                                        .requestMatchers(HttpMethod.POST, "/order").hasAnyAuthority(CLIENT)
                                        .requestMatchers(HttpMethod.PUT, "/order/**").hasAnyAuthority(CLIENT)
                                        .requestMatchers(HttpMethod.DELETE, "/order/**").hasAnyAuthority(CLIENT)
                                        .anyRequest()
                                        .authenticated())
                .build();
    }

    @Bean
    public NewTopic createCartRequest() {
        return TopicBuilder.name("CREATE_CART_REQUEST")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic createCartResponse() {
        return TopicBuilder.name("CREATE_CART_RESPONSE")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic updateStatusRequest() {
        return TopicBuilder.name("UPDATE_STATUS_REQUEST")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic updateStatusResponse() {
        return TopicBuilder.name("UPDATE_STATUS_RESPONSE")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic updateProductQuantity() {
        return TopicBuilder.name("UPDATE_PRODUCT_QUANTITY")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic createOrderRequest() {
        return TopicBuilder.name("CREATE_ORDER_REQUEST")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic createOrderResponse() {
        return TopicBuilder.name("CREATE_ORDER_RESPONSE")
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
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
