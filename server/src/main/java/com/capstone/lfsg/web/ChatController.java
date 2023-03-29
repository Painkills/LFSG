package com.capstone.lfsg.web;

import com.capstone.lfsg.data.Note;
import com.capstone.lfsg.data.Vote;
import com.capstone.lfsg.service.NoteService;
import com.capstone.lfsg.service.VoteService;
import com.itextpdf.text.BadElementException;
import org.apache.tomcat.util.json.JSONParser;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import javax.websocket.server.PathParam;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Controller
public class ChatController {

    private final NoteService noteService;
    private final SimpMessagingTemplate messageTemplate;
    private final VoteService voteService;

    public ChatController(NoteService noteService, SimpMessagingTemplate messageTemplate, VoteService voteService) {
        this.noteService = noteService;
        this.messageTemplate = messageTemplate;
        this.voteService = voteService;
    }

    // through GET /pdf
    @GetMapping("/pdf")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<Resource> createPDF() throws IOException, BadElementException {
        ByteArrayOutputStream out = noteService.makePDF();
        InputStream inputStream = new ByteArrayInputStream(out.toByteArray());
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; output.pdf");
        headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE);
        headers.add(HttpHeaders.CONTENT_LENGTH, String.valueOf(inputStream.available()));
        InputStreamResource resource = new InputStreamResource(inputStream);
        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }


    // /app/join
    @MessageMapping("/join/{roomId}")
    public void getNotesInRoom(@DestinationVariable String roomId, @Payload String username) {
        System.out.println(roomId + username);
        Iterable<Note> notesInRoom = noteService.getAllNotesByRoom(roomId);
        System.out.println("/room/" + roomId + "/notes/join/" + username);
        messageTemplate.convertAndSend("/room/" + roomId + "/notes/join/" + username, notesInRoom);
    }

    // /app/new
    @MessageMapping("/new")
//    @SendTo("/notes/unlabeled")
    public void receiveUnsortedNote(@Payload Note note) {
        System.out.println("From receiveUnsortedNote: " + note);
        noteService.saveNote(note);
        messageTemplate.convertAndSend("/room/" + note.getRoomId() + "/notes/unlabeled", note);
//        messageTemplate.convertAndSend("/notes/unlabeled", note);
    }


    // /app/labeled
    @MessageMapping("/labeled")
    public Note receiveLabeledNote(@Payload Note note) {
        System.out.println("From receiveLabeledNote: " + note);
        Note existingNote = noteService.labelNote(note.getId(), note.getLabel());
        messageTemplate.convertAndSend("/room/" + note.getRoomId() + "/notes/labeled/" + note.getLabel(), existingNote);
        return note;
    }

    // app/labeled/vote
    @MessageMapping("/vote")
    public Vote receiveVotedNote(@Payload Vote vote) {
        Vote existingVote = voteService.handleVote(vote);
        if (existingVote != null) {
            messageTemplate.convertAndSend("/room/" + vote.getRoomId() + "/votes/" + vote.getId(), existingVote);
        }
        // TODO: Frontend sends a vote, and if it receives a vote, it removes the upvote from it.
        return existingVote;
    }

}
