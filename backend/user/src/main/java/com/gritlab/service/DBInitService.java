package com.gritlab.service;

import com.gritlab.model.Role;
import com.gritlab.model.User;
import com.gritlab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class DBInitService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /*@Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;*/

    @Autowired
    private MongoTemplate mongoTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReadyEvent() {
        if (databaseIsAccessible()) {
            init();
        }
    }

    private boolean databaseIsAccessible() {
        try {
            // if the database is available, fetching the database names as a test.
            mongoTemplate.getDb().listCollectionNames().first();
            return true;
        } catch (Exception e) {
            System.out.println("Database is not accessible: " + e.getMessage());
            return false;
        }
    }

    public void init() {
        if (userRepository.findByRole(Role.SELLER).isEmpty()) {
            String sellerId = "";
            do {
                sellerId = UUID.randomUUID().toString().split("-")[0];
            } while (userRepository.existsById(sellerId));
            User seller = new User(sellerId,
                    "Default Seller", "", "", Role.SELLER, null, null);
            do {
                seller.setEmail(this.generateRandomEmail());
            } while (!this.validEmail(seller.getEmail()) || userRepository.findByEmail(seller.getEmail()).isPresent());
            String hashedPassword = passwordEncoder.encode("Seller1@" + sellerId);
            seller.setPassword(hashedPassword);
            userRepository.save(seller);
            //kafkaTemplate.send("DEFAULT_SELLER", sellerId);
        }
    }

    public boolean validEmail(String email) {
        String regex = "^[A-Za-z0-9+_.-]+@(.+)$";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(email);
        return matcher.matches();
    }

    public String generateRandomEmail() {
        return this.generateRandomString("abcdefghijklmnopqrstuvwxyz0123456789", 10, 14)
                + "@" + this.generateRandomString("abcdefghijklmnopqrstuvwxyz", 5, 7)
                + "." + this.generateRandomString("abcdefghijklmnopqrstuvwxyz", 2, 3);
    }

    public String generateRandomString(String characters, int minLength, int maxLength) {
        Random random = new Random();
        int length = minLength + random.nextInt(maxLength - minLength + 1);

        StringBuilder randomString = new StringBuilder();
        for (int i = 0; i < length; i++) {
            char randomChar = characters.charAt(random.nextInt(characters.length()));
            randomString.append(randomChar);
        }

        return randomString.toString();
    }
}
