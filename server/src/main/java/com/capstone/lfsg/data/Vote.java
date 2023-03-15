package com.capstone.lfsg.data;

import lombok.*;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Vote {

    @Id
    private String id;
    private String noteId;
    private String label;
    private String studentId;
    private String room;
}
