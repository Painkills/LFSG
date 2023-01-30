package com.capstone.lfsg.data;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Document(collection = "Students")
public class Student {

    @Id
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String avatarId;
    private int gold;

}
