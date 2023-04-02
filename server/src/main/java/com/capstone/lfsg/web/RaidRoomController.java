package com.capstone.lfsg.web;

import com.capstone.lfsg.data.Note;
import com.capstone.lfsg.service.RaidRoomService;
import com.itextpdf.text.BadElementException;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class RaidRoomController {

    private final RaidRoomService raidRoomService;
    private final SimpMessagingTemplate messageTemplate;
    private final Map<String, LocalDateTime> roomLatestMessageList;

    public RaidRoomController(RaidRoomService raidRoomService, SimpMessagingTemplate messageTemplate) {
        this.raidRoomService = raidRoomService;
        this.messageTemplate = messageTemplate;
        roomLatestMessageList = new HashMap<>();
    }

    // through GET /pdf
    @GetMapping("/pdf/{room}")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<Resource> createPDF(@PathVariable("room") String room) throws IOException, BadElementException {
        ByteArrayOutputStream out = raidRoomService.makePDF(room);
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
        roomLatestMessageList.put(roomId, LocalDateTime.now());
        System.out.println(roomLatestMessageList);
        Iterable<Note> notesInRoom = raidRoomService.getAllNotesByRoom(roomId);
        messageTemplate.convertAndSend("/room/" + roomId + "/notes/join/" + username, notesInRoom);
    }

    // /app/new
    @MessageMapping("/new")
//    @SendTo("/notes/unlabeled")
    public void receiveUnsortedNote(@Payload Note note) {
        System.out.println("From receiveUnsortedNote: " + note);
        raidRoomService.saveNote(note);
        messageTemplate.convertAndSend("/room/" + note.getRoomId() + "/notes/unlabeled", note);
    }


    // /app/labeled
    @MessageMapping("/labeled/{labelerId}")
    public void receiveLabeledNote(@Payload Note note, @DestinationVariable String labelerId) {
        System.out.println("From receiveLabeledNote: " + note);
        Note existingNote = raidRoomService.labelNote(note.getId(), note.getLabel(), labelerId);
        messageTemplate.convertAndSend("/room/" + note.getRoomId() + "/notes/labeled/", existingNote);
    }

    // app/labeled/vote
    @MessageMapping("/vote/{userName}")
    public void receiveVotedNote(@DestinationVariable String userName, @Payload Note note) {
        List<Note> modifiedNotes = raidRoomService.handleVote(userName, note);
        messageTemplate.convertAndSend("/room/" + note.getRoomId() + "/notes/voted/", modifiedNotes);
    }

    @Scheduled(fixedRate = 3600000) // check every 1 hours
    private void hasReceivedMessageRecently() {
        roomLatestMessageList.forEach((raidRoom, timeOfLastSubscription) -> {
            Duration duration = Duration.between(timeOfLastSubscription, LocalDateTime.now());
            if (duration.toHours() > 3) {
                awardGold(raidRoom);
            }
        });
    }

    private void awardGold(String raidRoom) {
        raidRoomService.awardGold(raidRoom);
    }
}
