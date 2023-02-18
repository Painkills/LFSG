package com.capstone.lfsg.web;

import com.capstone.lfsg.data.Note;
import com.capstone.lfsg.service.NoteService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Controller
public class ChatController {

    private final NoteService noteService;
    private final SimpMessagingTemplate messageTemplate;

    public ChatController(NoteService noteService, SimpMessagingTemplate messageTemplate) {
        this.noteService = noteService;
        this.messageTemplate = messageTemplate;
    }

    // through GET /pdf
    @GetMapping("/pdf")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<Resource> createPDF() throws IOException {
        noteService.makePDF();
        InputStream inputStream = new ClassPathResource("files/output.pdf").getInputStream();
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; output.pdf");
        headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE);
        headers.add(HttpHeaders.CONTENT_LENGTH, String.valueOf(inputStream.available()));
        InputStreamResource resource = new InputStreamResource(inputStream);
        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }

    // through websocket
//    @MessageMapping("/pdf")
//    public void handlePdfDownload(StompHeaderAccessor headerAccessor) throws Exception {
//        File file = new File("files/output.pdf");
//        byte[] pdfData = Files.readAllBytes(file.toPath());
//        headerAccessor.getSessionAttributes().put("pdfData", pdfData);
//    }

    // /app/notes
    @MessageMapping("/new")
    @SendTo("/notes/unlabeled")
    public Note receiveUnsortedNote(@Payload Note note) {
        System.out.println("From receiveUnsortedNote: " + note);
        noteService.saveNote(note);
        return note;
    }


    // /labeled/labelName
    @MessageMapping("/labeled")
    public Note receiveLabeledNote(@Payload Note note) {
        System.out.println("From receiveLabeledNote: " + note);
        Note existingNote = noteService.labelNote(note.getId(), note.getLabel());
        messageTemplate.convertAndSend("/notes/labeled/" + note.getLabel(), existingNote);
        return note;
    }


}
