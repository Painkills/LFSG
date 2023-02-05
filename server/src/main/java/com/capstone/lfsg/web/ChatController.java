package com.capstone.lfsg.web;

import com.capstone.lfsg.data.Note;
import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@AllArgsConstructor
@Controller
public class ChatController {

    private SimpMessagingTemplate messageTemplate;

    // /app/notes
    @MessageMapping("/new")
    @SendTo("/notes/unlabeled")
    public Note receiveUnsortedNote(@Payload Note note) {
        System.out.println(note);
        return note;
    }


    // /labeled/labelName
    @MessageMapping("/labeled")
    public Note receiveLabeledNote(@Payload Note note) {
        messageTemplate.convertAndSend("/notes/" + note.getLabel(), note);
        return note;
    }
}
