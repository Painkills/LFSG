import React, { useEffect, useState } from 'react'
import { over } from 'stompjs';
import { Modal, Button, Form } from "react-bootstrap";
import SockJS from 'sockjs-client';

let stompClient =null;
const ChatRoom = () => {
    const [labeledNotes, setLabeledNotes] = useState(new Map());
    const [unlabeledNotes, setUnlabeledNotes] = useState([]);
    const [tab,setTab] = useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: '',
        label: '',
        chatId: '',
        connected: false,
        message: ''
    });
    useEffect(() => {
        console.log(userData);
    }, [userData]);

    const connect =()=>{
        let Sock = new SockJS('http://localhost:8082/ws');
        stompClient = over(Sock);
        stompClient.connect({},onConnected, onError);
    }

    const onConnected = () => {
        setUserData({...userData,"connected": true});
        stompClient.subscribe('/notes/unlabeled', onNoteSubmitted);
        stompClient.subscribe('/notes/labeled/label01', onNoteLabeled);
        userJoin();
    }

    const userJoin=()=>{
        let chatMessage = {
            senderName: userData.username,
            status:"JOIN"
        };
        stompClient.send("/app/new", {}, JSON.stringify(chatMessage));
    }

    const onNoteSubmitted = (payload)=>{
        let payloadData = JSON.parse(payload.body);
        switch(payloadData.status){
            case "JOIN":
                // if(!unlabeledNotes.get(payloadData.senderName)){
                //     unlabeledNotes.set(payloadData.senderName,[]);
                //     setUnlabeledNotes(new Map(unlabeledNotes));
                // }

                break;
            case "MESSAGE":
                unlabeledNotes.push(payloadData);
                setUnlabeledNotes([...unlabeledNotes]);
                break;
        }
    }

    const onNoteLabeled = (payload)=>{
        let payloadData = JSON.parse(payload.body);
        if(labeledNotes.get(payloadData.label)){
            labeledNotes.get(payloadData.label).push(payloadData);
            setLabeledNotes(new Map(labeledNotes));
        }else{
            let list =[];
            list.push(payloadData);
            labeledNotes.set(payloadData.label, list);
            setLabeledNotes(new Map(labeledNotes));
        }
    }

    const onError = (err) => {
        console.log(err);

    }

    const handleMessage =(event)=>{
        const {value}=event.target;
        setUserData({...userData,"message": value});
    }

    const handleLabelSelect =(event)=>{
        const value = event.target.id;
        setUserData({...userData,"chatId": value});
    }

    const handleLabelInput = (event) => {
        const {value} = event.target;
        setUserData({...userData, "label": value});
    }

    const sendNote=()=>{
        if (stompClient) {
            let chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status:"MESSAGE"
            };
            console.log(chatMessage);
            stompClient.send("/app/new", {}, JSON.stringify(chatMessage));
            setUserData({...userData,"message": ""});
        }
    }

    const sendPrivateValue=()=>{
        if (stompClient) {
            let chatMessage = {
                senderName: userData.username,
                label: tab,
                message: userData.message,
                status:"MESSAGE"
            };

            if(userData.username !== tab){
                labeledNotes.get(tab).push(chatMessage);
                setLabeledNotes(new Map(labeledNotes));
            }
            stompClient.send("/app/labeled", {}, JSON.stringify(chatMessage));
            setUserData({...userData,"message": ""});
        }
    }

    const labelNote = () => {
        let note = unlabeledNotes[userData.chatId]
        note.label = userData.label;
        stompClient.send("/app/labeled", {}, JSON.stringify(note));
        setUserData({...userData,"message": ""});
    }

    const handleUsername=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"username": value});
    }

    const registerUser=()=>{
        connect();
    }

    return (
        // Chat Box
        <div className="container">
            {userData.connected? // If the user IS connected...

                // List of Labels
                <div className="chat-box">
                    <div className="member-list">
                        <ul>
                            <li onClick={()=>{setTab("CHATROOM")}} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
                            {[...labeledNotes.keys()].map((name,index)=>(
                                <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>{name}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Unlabelled notes box */}
                    {tab==="CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages">
                            {unlabeledNotes.map((chat,index)=>(
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.message}</div>
                                    <div className="message-id">
                                        <input id={`${index}`} type="text" className="message-id" placeholder="label" value={userData.label} onChange={handleLabelInput} onSelect={handleLabelSelect} />
                                        <button type="button" className="mini-button" onClick={labelNote}>Set</button>
                                    </div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>
                        {/* Enter message and send */}
                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendNote}>Submit unlabeled note</button>
                        </div>
                    </div>}

                    {/* Labeled notes box */}
                    {tab!=="CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages">
                            {[...labeledNotes.get(tab)].map((chat,index)=>(
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>
                        {/* Enter message and send */}
                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendPrivateValue}>Submit to this label</button>
                        </div>

                    </div>}
                </div>

                // If not connected
                :

                // Registration box
                <div className="register">
                    <input
                        id="user-name"
                        placeholder="Enter your name"
                        name="userName"
                        value={userData.username}
                        onChange={handleUsername}
                    />
                    <button type="button" onClick={registerUser}>
                        connect
                    </button>
                </div>}
        </div>
    )
}

export default ChatRoom