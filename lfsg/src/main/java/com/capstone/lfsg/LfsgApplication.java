package com.capstone.lfsg;

import com.capstone.lfsg.data.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication(exclude={MongoAutoConfiguration.class})
@EnableMongoRepositories
public class LfsgApplication{

	public static void main(String[] args) {
		SpringApplication.run(LfsgApplication.class, args);
	}

}
