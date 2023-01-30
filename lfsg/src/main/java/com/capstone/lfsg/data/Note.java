package com.capstone.lfsg.data;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Note {

    private String userName;
    private String label;
    private String text;
    private String date;
    private Status status;
    private Integer gold;


}
