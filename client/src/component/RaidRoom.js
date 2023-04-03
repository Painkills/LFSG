import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import OpenedNote from './OpenedNote'
import Sword from '../assets/sword.png'
import Staff from '../assets/staff.png'
import Gate from '../assets/Gate_Closed.png'

let stompClient =null;
const RaidRoom = () => {
    const location = useLocation()
    const roomId = location.state.roomId
    const userName = location.state.username
    // STATES
    const [labeledNotes, setLabeledNotes] = useState(new Map());
    const [unlabeledNotes, setUnlabeledNotes] = useState([]);
    const [tab,setTab] = useState("UNLABELED");
    const [openNote, setOpenNote] = useState(false);
    const [selectedNote, setSelectedNote] = useState(undefined);
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
    useEffect(() => {
        // this code will run when the component is first shown
        connect()
    }, []);

    const connect =()=>{
        // const Sock = new SockJS('https://lfsg1-d4tich.b4a.run/wss', null, {
        //     transports: ['websocket'],
        //     secure: true,
        //     rejectUnauthorized: false
        // });
        // let Sock = new SockJS('https://lfsg1-d4tich.b4a.run/');
        let Sock = new SockJS('http://localhost:8082/ws');
        stompClient = over(Sock);
        stompClient.connect({},onConnected, onError);
    }

    const onConnected = () => {
        stompClient.subscribe('/room/' + roomId + '/notes/unlabeled', onNoteSubmitted);
        stompClient.subscribe('/room/' + roomId + '/notes/labeled/', onNoteLabeled);
        stompClient.subscribe('/room/' + roomId + '/notes/join/' + userName, onJoined);
        stompClient.subscribe('/room/' + roomId + '/notes/voted/', onVote);
        userJoin(userName);
    }

    const userJoin=(user)=>{
        stompClient.send("/app/join/" + roomId, {}, user);
    }

    // METHODS THAT HANDLE MESSAGES RECEIVED FROM SERVER
    const onNoteSubmitted = (payload) =>{
        let payloadData = JSON.parse(payload.body)
        unlabeledNotes.push(payloadData);
        setUnlabeledNotes([...unlabeledNotes]);
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
                senderName: userName,
                message: userData.message,
                status:"MESSAGE",
                roomId: roomId
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
            stompClient.send("/app/labeled/" + userName, {}, JSON.stringify(note));
        }
        setUserData({...userData, "label": ""});
    }

    const vote = (note) => {
        if (stompClient) {
            stompClient.send("/app/vote/" + userName, {}, JSON.stringify(note))
        }
    }

    // REQUEST PDF OF NOTES FROM SERVER
    const getPdf = () => {
        fetch('http://localhost:8082/pdf/' + roomId)
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


    // ===================== ACTUAL RENDERED PAGE BELOW THIS POINT ==================
    return (
        // Raid Room Area
        <div className="container">
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
                                            <li className={`message ${currentNote.senderName === userName && "self"}`} key={index}>
                                                {currentNote.senderName !== userName}
                                                <button type="button" className="scroll" onClick={() => onSelectedNote(index)}>Open Note</button>

                                                {/*Placeholder so I can see what is in these*/}
                                                <div className="message-preview">{currentNote.message}</div>

                                                { (openNote === true && selectedNote === index) ? (
                                                    <OpenedNote trigger={openNote}>
                                                        <div className="message-full">{currentNote.message}</div>
                                                        <div className="message-full">Author: {currentNote.senderName}</div>
                                                        <div className="message-id">
                                                            { (userRole.role === 'labeler') ? (
                                                                <div>
                                                                    <input type="text" className="message-id" placeholder="choose a label" value={userData.label} onChange={handleLabelInput}/>
                                                                    <button type="button" className="mini-button" onClick={() => labelNote(index)}>Set</button>
                                                                </div>
                                                            ) : (
                                                                <div> </div>
                                                            )
                                                            }
                                                            <div>
                                                                <button type="button" className="mini-button" onClick={() => setOpenNote(false)}>Close</button>
                                                            </div>
                                                        </div>
                                                    </OpenedNote>
                                                ) : null
                                                }
                                                {currentNote.senderName === userName}
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
                                        <li className={`message ${note.senderName === userName && "self"}`} key={id}>
                                            {note.senderName !== userName}
                                            <button type="button" className="scroll" onClick={() => onSelectedNote(id)}>Open Note</button>

                                            {/*Placeholder so I can see what is in these*/}
                                            <div className="message-preview">{note.message}</div>

                                            { (openNote === true && selectedNote === id) ? (
                                                <OpenedNote trigger={openNote}>
                                                    <div className="message-full">Gold: {note.gold}</div>
                                                    <div className="message-full">{note.message}</div>
                                                    <div className="message-full">Author: {note.senderName}</div>
                                                    <div>
                                                        <button type="button" className="mini-button" onClick={() => vote(note)}>Give Gold!</button>
                                                    </div>
                                                    <div>
                                                        <button type="button" className="mini-button" onClick={() => setOpenNote(false)}>Close</button>
                                                    </div>
                                                </OpenedNote>
                                            ) : null
                                            }
                                            {note.senderName === userName}
                                        </li>
                                    ))}
                                </ul>
                            </div>}
                            <div>
                                <button type="button" className="send-button" onClick={getPdf}>getPDF</button>
                            </div>
                        </div>
                    ) :
                    <div id="role-select">
                        <div className="role-object">
                            <img src={Sword} className="role-img" alt={Sword} onClick={() => setUserRole({...userRole, "role" : 'notetaker'})}/>
                            Note Taker
                        </div>
                        <div className="role-object">
                            <img src={Staff} className="role-img" alt={Staff} onClick={() => setUserRole({...userRole, "role" : 'labeler'})}/>
                            Labeler
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default RaidRoom