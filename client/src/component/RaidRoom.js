import React, { useEffect, useState } from 'react'
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import OpenedNote from './OpenedNote'
import {forEach} from "react-bootstrap/ElementChildren";

let stompClient =null;
const RaidRoom = () => {
    const [raidRoomId, setRaidRoomId] = useState("112");

    const [registerPage, setRegisterPage] = useState(false);
    const [labeledNotes, setLabeledNotes] = useState(new Map());
    const [unlabeledNotes, setUnlabeledNotes] = useState([]);
    const [tab,setTab] = useState("UNLABELED");
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

    const [userRole, setUserRole] = useState({
        role: 'none'
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
        // stompClient.subscribe('/notes/unlabeled', onNoteSubmitted);
        stompClient.subscribe('/room/' + raidRoomId + '/notes/unlabeled', onNoteSubmitted);
        stompClient.subscribe('/room/' + raidRoomId + '/notes/labeled/*', onNoteLabeled);
        stompClient.subscribe('/room/' + raidRoomId + '/notes/join', onJoined)
        userJoin();
    }

    const userJoin=()=>{
        stompClient.send("/app/join", {}, raidRoomId);
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
        setUnlabeledNotes(unlabeledNotes.filter((note) => note.id !== payloadData.id))
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

    const onJoined = (payload) => {
        const noteArray = JSON.parse(payload.body);
        console.log(typeof(noteArray))
        noteArray.forEach((note) => {
            unlabeledNotes.push(note);
            setUnlabeledNotes([...unlabeledNotes]);
        })
        console.log(unlabeledNotes)
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
                status:"MESSAGE",
                roomId: raidRoomId
            };
            stompClient.send("/app/new", {}, JSON.stringify(chatMessage));
            setUserData({...userData,"message": ""});
        }
    }

    const labelNote = (index) => {
        setOpenNote(false);
        let note = unlabeledNotes[index]
        let labelArray = userData.label.split(',')
        for (let index in labelArray) {
            note.label = labelArray[index];
            stompClient.send("/app/labeled", {}, JSON.stringify(note));
        }
        setUserData({...userData, "label": ""});
    }

    const [openNote, setOpenNote] = useState(false);
    const [selectedNote, setSelectedNote] = useState(undefined);

    const onSelectedNote = (index) => {
        setSelectedNote(index);
        setOpenNote(true);
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

    const getPdf = () => {
        fetch('http://localhost:8082/pdf')
            .then(response => {
                const contentDisposition = response.headers.get('Content-Disposition');
                const filenameMatch = contentDisposition ? contentDisposition.match(/filename="(.+)"/) : null;
                const filename = filenameMatch ? filenameMatch[1] : 'document.pdf';
                return response.blob().then(blob => {
                    console.log(blob)
                    // Save the file to the user's device
                    const url = window.URL.createObjectURL(new Blob([blob]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
            })
            .catch(error => {
                console.error('Error downloading file:', error);
            });
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
                        onBlur={validateInput}/>
                    {error.name && <span className='err'>{error.name}</span>}
                    </div>
                    <div style={{display: "flex"}}>
                    <input
                        type="text"
                        name="email"
                        placeholder='Enter Email'
                        value={input.email}
                        onChange={onInputChange}
                        onBlur={validateInput}/>
                    {error.email && <span className='err'>{error.email}</span>}
                    </div>

                    <div style={{display: "flex"}}>
                    <input
                        type="password"
                        name="password"
                        placeholder='Enter Password'
                        value={input.password}
                        onChange={onInputChange}
                        onBlur={validateInput}/>
                    {error.password && <span className='err'>{error.password}</span>}
                    </div>

                    <div style={{display: "flex"}}>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder='Enter Confirm Password'
                        value={input.confirmPassword}
                        onChange={onInputChange}
                        onBlur={validateInput}/>
                    {error.confirmPassword && <span className='err'>{error.confirmPassword}</span>}
                    </div>

                    <button onClick={Validate}>Submit</button>
                </form>
            </div>
        )
    }
    if (registerPage === false) {
        return (
            // Raid Room Area
        <div className="container">
            {userData.connected? // If the user IS connected...

                <div>
                    { (userRole.role === 'labeler' || userRole.role === 'notetaker') ? (
                            <div className="chat-box">
                                <div className="member-list">
                                    <ul>
                                        <li onClick={()=>{setTab("UNLABELED")}} className={`member ${tab==="UNLABELED" && "active"}`}>Unlabeled</li>
                                        {[...labeledNotes.keys()].map((name,index)=>(
                                            <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>Label: {name}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Unlabelled notes box */}
                                {tab==="UNLABELED" && <div className="chat-content">
                                    <ul className="chat-messages">
                                        {unlabeledNotes.map((currentNote,index) => {
                                            if (currentNote.label !== null) return null;
                                            return (
                                                <li className={`message ${currentNote.senderName === userData.username && "self"}`} key={index}>
                                                    {currentNote.senderName !== userData.username && <div className="avatar">{currentNote.senderName}</div>}
                                                    <button type="button" className="mini-button" onClick={() => onSelectedNote(index)}>Open Note</button> {/*t*/}
                                                    { (openNote === true && selectedNote === index) ? (
                                                        <OpenedNote trigger={openNote}>
                                                            <div className="message-data">{currentNote.message}</div>
                                                            <div className="message-id">
                                                                { (userRole.role === 'labeler') ? (
                                                                    <div>
                                                                        <input type="text" className="message-id" placeholder="choose a label" value={userData.label} onChange={handleLabelInput}/>
                                                                        <button type="button" className="mini-button" onClick={() => labelNote(index)}>Set</button>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <p>Vote Placeholder</p>
                                                                    </div>
                                                                )
                                                                }
                                                                <div>
                                                                    <button type="button" className="mini-button" onClick={() => setOpenNote(false)}>Close</button>
                                                                </div>
                                                            </div>
                                                        </OpenedNote>
                                                    ) : null
                                                    }
                                                    {currentNote.senderName === userData.username && <div className="avatar self">{currentNote.senderName}</div>}
                                                </li>
                                            )})}
                                    </ul>
                                    {/* Enter message and send */}
                                    { (userRole.role === 'notetaker') ? (
                                            <div className="send-message">
                                                <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
                                                <button type="button" className="send-button" onClick={sendNote}>Submit</button>
                                            </div>
                                        ) : null
                                    }
                                </div>}

                                {/* Labeled notes box */}
                                {tab!=="UNLABELED" && <div className="chat-content">
                                    <ul className="chat-messages">
                                        {[...labeledNotes.get(tab)].map((chat,index)=>(
                                            <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                                {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                                <button type="button" className="mini-button" onClick={() => onSelectedNote(index)}>Open Note</button>
                                                { (openNote === true && selectedNote === index) ? (
                                                    <OpenedNote trigger={openNote}>
                                                        <div className="message-data">{chat.message}</div>
                                                        <div>
                                                            <button type="button" className="mini-button" onClick={() => setOpenNote(false)}>Close</button>
                                                        </div>
                                                    </OpenedNote>
                                                ) : null
                                                }
                                                {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>}
                                <div>
                                    <button type="button" className="send-button" onClick={getPdf}>getPDF</button>
                                </div>
                            </div>
                        ) :
                        <div>
                            <button type="button" className="mini-button" onClick={() => setUserRole({...userRole, "role" : 'notetaker'})}>Note Taker</button>
                            <button type="button" className="mini-button" onClick={() => setUserRole({...userRole, "role" : 'labeler'})}>Labeler</button>
                        </div>
                    }
                </div>
                // List of Labels

                    :
                    <div className="register">
                        <input
                            id="user-name"
                            placeholder="Enter your name"
                            name="userName"
                            value={userData.username}
                            onChange={handleUsername}
                        />
                        <input
                            id="user-pass"
                            placeholder="Enter your password"
                            name="password"
                            value={userData.password}
                            onChange={handlePassword}
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

export default RaidRoom