import React, { useEffect, useState } from 'react'
import { over } from 'stompjs';
import { Modal, Button, Form } from "react-bootstrap";
import SockJS from 'sockjs-client';

let stompClient =null;
const ChatRoom = () => {
    const [registerPage, setRegisterPage] = useState(false);
    const [labeledNotes, setLabeledNotes] = useState(new Map());
    const [unlabeledNotes, setUnlabeledNotes] = useState([]);
    const [tab,setTab] = useState("CHATROOM");
		const [input, setInput] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [userData, setUserData] = useState({
        username: '',
        password: '',
        label: '',
        connected: false,
        message: ''
    });

    // useEffect(() => {
    //     console.log(unlabeledNotes)
    // }, [unlabeledNotes]);

    const connect =()=>{
        let Sock = new SockJS('http://localhost:8082/ws');
        stompClient = over(Sock);
        stompClient.connect({},onConnected, onError);
    }

    const onConnected = () => {
        setUserData({...userData,"connected": true});
        stompClient.subscribe('/notes/unlabeled', onNoteSubmitted);
        stompClient.subscribe('/notes/labeled/*', onNoteLabeled);
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
        let payloadData = JSON.parse(payload.body)
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
        console.log(unlabeledNotes)
        setUnlabeledNotes(unlabeledNotes.filter((note) => note.id !== payloadData.id))
        console.log(unlabeledNotes)
        if(labeledNotes.get(payloadData.label)){
            labeledNotes.get(payloadData.label).push(payloadData);
            setLabeledNotes(new Map(labeledNotes));
        }else{
            let list =[];
            list.push(payloadData);
            labeledNotes.set(payloadData.label, list);
            setLabeledNotes(new Map(labeledNotes));
        }
        // let updatedNotes = unlabeledNotes
        // updatedNotes = updatedNotes.filter(note => note.id !== payloadData.id)
        // setUnlabeledNotes(updatedNotes);
    }

    const onError = (err) => {
        console.log(err);

    }

    const handleMessage =(event)=>{
        const {value}=event.target;
        setUserData({...userData,"message": value});
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
            stompClient.send("/app/new", {}, JSON.stringify(chatMessage));
            setUserData({...userData,"message": ""});
        }
    }

    const labelNote = (index) => {
        let note = unlabeledNotes[index]
        let labelArray = userData.label.split(',')
        for (let index in labelArray) {
            note.label = labelArray[index];
            stompClient.send("/app/labeled", {}, JSON.stringify(note));
        }
        setUserData({...userData,"label": ""});
    }

    const handleUsername=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"username": value});
    }
    const handlePassword=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"password": value});
    }

    const registerUser=()=>{
        connect();
    }

    const onChangeRegisterPage=()=>{
        if(registerPage === false){
            setRegisterPage(true);
        }else{
            setRegisterPage(false)
        }
    }

//THIS ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


    const onInputChange = e => {
        const { name, value } = e.target;
        setInput(prev => ({
            ...prev,
            [name]: value
        }));
        validateInput(e);
    }

    const validateInput = e => {
        let { name, value } = e.target;
        setError(prev => {
            const stateObj = { ...prev, [name]: "" };

            switch (name) {
                case "name":
                    if (!value) {
                        stateObj[name] = "Please enter Name.";
                    }
                    break;
                    case "email":
                    if (!value) {
                        stateObj[name] = "Please enter Email.";
                    }
                    break;

                case "password":
                    if (!value) {
                        stateObj[name] = "Please enter Password.";
                    } else if (input.confirmPassword && value !== input.confirmPassword) {
                        stateObj["confirmPassword"] = "Password and Confirm Password does not match.";
                    } else {
                        stateObj["confirmPassword"] = input.confirmPassword ? "" : error.confirmPassword;
                    }
                    break;

                case "confirmPassword":
                    if (!value) {
                        stateObj[name] = "Please enter Confirm Password.";
                    } else if (input.password && value !== input.password) {
                        stateObj[name] = "Password and Confirm Password does not match.";
                    }
                    break;

                default:
                    break;
            }

            return stateObj;
        });
    }

    if(registerPage === true){
        function Validate() {
            if (input.password !== input.confirmPassword) {
                alert("Passwords do not match.");
                return false;
            }
            return true;
        }
        return(
            <div className="app">
                <form>
                    <div style={{display: "flex"}}>
                    <input
                        type="text"
                        name="name"
                        placeholder='Enter Name'
                        value={input.name}
                        onChange={onInputChange}
                        onBlur={validateInput}></input>
                    {error.name && <span className='err'>{error.name}</span>}
                    </div>
                    <div style={{display: "flex"}}>
                    <input
                        type="text"
                        name="email"
                        placeholder='Enter Email'
                        value={input.email}
                        onChange={onInputChange}
                        onBlur={validateInput}></input>
                    {error.email && <span className='err'>{error.email}</span>}
                    </div>

                    <div style={{display: "flex"}}>
                    <input
                        type="password"
                        name="password"
                        placeholder='Enter Password'
                        value={input.password}
                        onChange={onInputChange}
                        onBlur={validateInput}></input>
                    {error.password && <span className='err'>{error.password}</span>}
                    </div>

                    <div style={{display: "flex"}}>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder='Enter Confirm Password'
                        value={input.confirmPassword}
                        onChange={onInputChange}
                        onBlur={validateInput}></input>
                    {error.confirmPassword && <span className='err'>{error.confirmPassword}</span>}
                    </div>

                    <button onClick={Validate}>Submit</button>
                </form>
            </div>
        )
    }
    if (registerPage === false) {
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
                                        <input type="text" className="message-id" placeholder="choose a label" value={userData.label} onChange={handleLabelInput}/>
                                        <button type="button" className="mini-button" onClick={() => labelNote(index)}>Set</button>
                                    </div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>
                        {/* Enter message and send */}
                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendNote}>Submit</button>
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
                        {/*/!* Enter message and send *!/*/}
                        {/*<div className="send-message">*/}
                        {/*    <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />*/}
                        {/*    <button type="button" className="send-button" onClick={sendPrivateValue}>Submit to this label</button>*/}
                        {/*</div>*/}

                    </div>}
                </div>
                    :
                    <div className="register">
                        <input
                            id="user-name"
                            placeholder="Enter your name"
                            name="userName"
                            value={userData.username}
                            onChange={handleUsername}
                            margin="normal"
                        />
                        <input
                            id="user-pass"
                            placeholder="Enter your password"
                            name="password"
                            value={userData.password}
                            onChange={handlePassword}
                            margin="normal"
                        />

                        <button type="button" onClick={registerUser}>
                            Sign in
                        </button>
                        <button type="button" onClick={onChangeRegisterPage}>
                            Register
                        </button>

                    </div>

                }


            </div>
        )
    }
}

export default ChatRoom