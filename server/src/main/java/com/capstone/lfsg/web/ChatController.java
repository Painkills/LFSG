package com.capstone.lfsg.web;

import com.capstone.lfsg.data.Note;
import com.capstone.lfsg.service.NoteService;
import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final NoteService noteService;
    private SimpMessagingTemplate messageTemplate;

    public ChatController(NoteService noteService) {
        this.noteService = noteService;
    }

    // /app/notes
    @MessageMapping("/new")
    @SendTo("/notes/unlabeled")
    public Note receiveUnsortedNote(@Payload Note note) {
        System.out.println(note);
        noteService.saveNote(note);
        return note;
    }


    // /labeled/labelName
    @MessageMapping("/labeled")
    public Note receiveLabeledNote(@Payload Note note) {
        Note existingNote = noteService.labelNote(note.getId(), note.getLabel());
        messageTemplate.convertAndSend("/notes/" + note.getLabel(), existingNote);
        return note;
    }
}
