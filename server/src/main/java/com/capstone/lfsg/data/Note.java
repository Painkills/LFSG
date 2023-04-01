package com.capstone.lfsg.data;

import lombok.*;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Note {

    @Id
    private String id;
    private String senderId;
    private String label;
    private String message;
    private String roomId;
    private LocalDateTime createdAt;
    private Status status;
    private Integer gold = 0;
}
