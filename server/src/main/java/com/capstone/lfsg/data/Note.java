package com.capstone.lfsg.data;

import lombok.*;
import org.springframework.data.annotation.Id;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Note {

    @Id
    private String id;
    private String userName;
    private String label;
    private String message;
    private String date;
    private Status status;
    private Integer gold;


}
