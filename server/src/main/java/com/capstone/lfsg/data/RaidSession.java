package com.capstone.lfsg.data;

import lombok.*;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class RaidSession {
    @Id
    private String id;
    private List<Student> participants;
    private String label;
    private List<Note> notes;
    private LocalDateTime createdAt;
}
