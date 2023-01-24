package com.capstone.lfsg.web;

import com.capstone.lfsg.data.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messageTemplate;

    // /app/note
    @MessageMapping("/note")
    @SendTo("/note/unsorted")
    public Message receiveUnsortedNote(@Payload Message message) {
        return message;
    }

    // /app/chatroom
    @MessageMapping("/message")
    @SendTo("/chatroom/public")
    public Message receivePublicMessage(@Payload Message message) {
        return message;
    }

    // /user/Name/private
    @MessageMapping("/private-message")
    public Message receivePrivateMessage(@Payload Message message) {

        messageTemplate.convertAndSendToUser(message.getReceiverName(), "/private", message);
        return message;
    }
}
