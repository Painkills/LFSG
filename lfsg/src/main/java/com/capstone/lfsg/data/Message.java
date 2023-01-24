package com.capstone.lfsg.data;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Message {

    private String senderName;
    private String receiverName;
    private String text;
    private String date;
    private Status status;


}
