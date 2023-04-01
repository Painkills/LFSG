import React, { useEffect, useState } from 'react'
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import OpenedNote from './OpenedNote'

let stompClient =null;
const RaidRoom = () => {
    // STATES
    const [raidRoomId, setRaidRoomId] = useState("112");
    const [registerPage, setRegisterPage] = useState(false);
    const [labeledNotes, setLabeledNotes] = useState(new Map());
    const [unlabeledNotes, setUnlabeledNotes] = useState([]);
    const [tab,setTab] = useState("UNLABELED");
    const [openNote, setOpenNote] = useState(false);
    const [selectedNote, setSelectedNote] = useState(undefined);
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

    // CONNECTION
    const connect =()=>{
        let Sock = new SockJS('http://localhost:8082/ws');
        stompClient = over(Sock);
        stompClient.connect({},onConnected, onError);
    }

    const onConnected = () => {

        setUserData({...userData,"connected": true});
        stompClient.subscribe('/room/' + raidRoomId + '/notes/unlabeled', onNoteSubmitted);
        stompClient.subscribe('/room/' + raidRoomId + '/notes/labeled/', onNoteLabeled);
        stompClient.subscribe('/room/' + raidRoomId + '/notes/join/' + userData.username, onJoined);
        stompClient.subscribe('/room/' + raidRoomId + '/notes/voted/', onVote);
        userJoin(userData.username);
    }

    const userJoin=(user)=>{
        stompClient.send("/app/join/" + raidRoomId, {}, user);
    }

    // METHODS THAT HANDLE MESSAGES RECEIVED FROM SERVER
    const onNoteSubmitted = (payload) =>{
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

    const onNoteLabeled = (payload) =>{
        let receivedNote = JSON.parse(payload.body);
        // set the label for the note in unlabeledNotes, which will make it not show up in that category.
        unlabeledNotes.map((note) => {
            if (note.id === receivedNote.id) {
                note.label = receivedNote.label;
            }
        })
        noteLabelHelper(receivedNote)
    }

    const onJoined = (payload) => {
        const noteArray = JSON.parse(payload.body);
        noteArray.forEach((note) => {
            if (note.label != null) {
                noteLabelHelper(note)
            } else {
                unlabeledNotes.push(note);
                setUnlabeledNotes([...unlabeledNotes]);
            }
        })
    }

    const onError = (err) => {
        console.log(err);

    }

    const onVote = (payload) => {
        const modifiedNotesArray = JSON.parse(payload.body);
        modifiedNotesArray.forEach((modifiedNote) => {
            const label = modifiedNote.label
            const id = modifiedNote.id
            const gold = modifiedNote.gold
            setLabeledNotes(prevState => {
                // Create a new copy of the labeledNotes object
                const newLabeledNotes = new Map(prevState)
                // Get the existing labeled note object with the given ID
                const existingLabeledNote = newLabeledNotes.get(label).get(id)
                // Create a new copy of the existing labeled note object with the updated gold property
                const updatedLabeledNote = { ...existingLabeledNote, gold }
                // Set the updated labeled note object in the newLabeledNotes map
                newLabeledNotes.get(label).set(id, updatedLabeledNote)
                // Return the newLabeledNotes map to update the state
                return newLabeledNotes
            })
        })
    }

    const noteLabelHelper = (receivedNote) => {
        // If note has a label, add it to that label in labeledNotes
        if(labeledNotes.get(receivedNote.label)){
            labeledNotes.get(receivedNote.label).set(receivedNote.id, receivedNote);
            setLabeledNotes(new Map(labeledNotes));
        // if not, create a new label key in labeledNotes and save it there
        }else{
            let list = new Map();
            list.set(receivedNote.id, receivedNote);
            labeledNotes.set(receivedNote.label, list);
            setLabeledNotes(new Map(labeledNotes));
        }
    }

    // METHODS THAT SEND THINGS TO SERVER
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
        let labelArray = userData.label.trim().split(',')
        for (let index in labelArray) {
            note.label = labelArray[index];
            stompClient.send("/app/labeled", {}, JSON.stringify(note));
        }
        setUserData({...userData, "label": ""});
    }

    const vote = (note) => {
        if (stompClient) {
            stompClient.send("/app/vote/" + userData.username, {}, JSON.stringify(note))
        }
    }

    // REQUEST PDF OF NOTES FROM SERVER
    const getPdf = () => {
        fetch('http://localhost:8082/pdf/' + raidRoomId)
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

    // FORM HANDLING METHODS
    const handleMessage =(event)=>{
        const {value}=event.target;
        setUserData({...userData,"message": value});
    }

    const handleLabelInput = (event) => {
        const {value} = event.target;
        setUserData({...userData, "label": value});
    }

    const onSelectedNote = (index) => {
        setSelectedNote(index);
        setOpenNote(true);
    }

    // LOGIN METHODS
    const handleUsername=(event)=>{
        const {value} = event.target;
        setUserData({...userData,"username": value});
    }

    const handlePassword=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"password": value});
    }

    const onChangeRegisterPage=()=>{
        if(registerPage === false){
            setRegisterPage(true);
        }else{
            setRegisterPage(false)
        }
    }

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

    // ===================== ACTUAL RENDERED PAGE BELOW THIS POINT ==================
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
                                                        <button type="button" className="mini-button" onClick={() => onSelectedNote(index)}>Open Note</button>

                                                        {/*Placeholder so I can see what is in these*/}
                                                        <div className="message-data">{currentNote.message}</div>

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
                                                                            <button type="button" className="mini-button" onClick={() => vote(currentNote)}>Open Note</button>
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
                                            {[...labeledNotes.get(tab)].map(([id, note])=>(
                                                <li className={`message ${note.senderName === userData.username && "self"}`} key={id}>
                                                    {note.senderName !== userData.username && <div className="avatar">{note.senderName}</div>}
                                                    <button type="button" className="mini-button" onClick={() => onSelectedNote(id)}>Open Note</button>

                                                    {/*Placeholder so I can see what is in these*/}
                                                    <div className="message-data">{note.message}</div>

                                                    { (openNote === true && selectedNote === id) ? (
                                                        <OpenedNote trigger={openNote}>
                                                            <div className="message-data">Gold: {note.gold}</div>
                                                            <div className="message-data">{note.message}</div>
                                                            <div>
                                                                <button type="button" className="mini-button" onClick={() => vote(note)}>Give Gold!</button>
                                                            </div>
                                                            <div>
                                                                <button type="button" className="mini-button" onClick={() => setOpenNote(false)}>Close</button>
                                                            </div>
                                                        </OpenedNote>
                                                    ) : null
                                                    }
                                                    {note.senderName === userData.username && <div className="avatar self">{note.senderName}</div>}
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

                        :
                        <div className="register">
                            <input
                                id="user-name"
                                placeholder="Enter your name"
                                name="userName"
                                value= {userData.username}
                                onChange={handleUsername}
                            />
                            <input
                                id="user-pass"
                                placeholder="Enter your password"
                                name="password"
                                value={userData.password}
                                onChange={handlePassword}
                            />

                            <button type="button" onClick={connect}>
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