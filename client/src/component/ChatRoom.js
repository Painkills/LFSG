import React, { useEffect, useState } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient =null;
const ChatRoom = () => {
    const [privateChats, setPrivateChats] = useState(new Map());
    const [publicChats, setPublicChats] = useState([]);
    const [tab,setTab] =useState("CHATROOM");
    const [registerPage, setRegisterPage] = useState(false)
    const [userData, setUserData] = useState({

        username: '',
        password: '',
        receivername: '',
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
        stompClient.subscribe('/notes/unlabeled', onMessageReceived);
        stompClient.subscribe('/notes/labeled/label01', onPrivateMessage);
        userJoin();
    }

    const userJoin=()=>{
        var chatMessage = {
            senderName: userData.username,
            status:"JOIN"
        };
        stompClient.send("/app/notes", {}, JSON.stringify(chatMessage));
    }

    const onMessageReceived = (payload)=>{
        var payloadData = JSON.parse(payload.body);
        switch(payloadData.status){
            case "JOIN":
                if(!privateChats.get(payloadData.senderName)){
                    privateChats.set(payloadData.senderName,[]);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
        }
    }

    const onPrivateMessage = (payload)=>{
        console.log(payload);
        var payloadData = JSON.parse(payload.body);
        if(privateChats.get(payloadData.senderName)){
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        }else{
            let list =[];
            list.push(payloadData);
            privateChats.set(payloadData.senderName,list);
            setPrivateChats(new Map(privateChats));
        }
    }

    const onError = (err) => {
        console.log(err);

    }

    const handleMessage =(event)=>{
        const {value}=event.target;
        setUserData({...userData,"message": value});
    }
    const sendValue=()=>{
        if (stompClient) {
            var chatMessage = {
                userName: userData.username,
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
            var chatMessage = {
                senderName: userData.username,
                receiverName:tab,
                message: userData.message,
                status:"MESSAGE"
            };

            if(userData.username !== tab){
                privateChats.get(tab).push(chatMessage);
                setPrivateChats(new Map(privateChats));
            }
            stompClient.send("/app/notes", {}, JSON.stringify(chatMessage));
            setUserData({...userData,"message": ""});
        }
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
            <div className="container">
                {userData.connected ?
                    <div className="chat-box">
                        <div className="member-list">
                            <ul>
                                <li onClick={() => {
                                    setTab("CHATROOM")
                                }} className={`member ${tab === "CHATROOM" && "active"}`}>Chatroom
                                </li>
                                {[...privateChats.keys()].map((name, index) => (
                                    <li onClick={() => {
                                        setTab(name)
                                    }} className={`member ${tab === name && "active"}`} key={index}>{name}</li>
                                ))}
                            </ul>
                        </div>
                        {tab === "CHATROOM" && <div className="chat-content">
                            <ul className="chat-messages">
                                {publicChats.map((chat, index) => (
                                    <li className={`message ${chat.senderName === userData.username && "self"}`}
                                        key={index}>
                                        {chat.senderName !== userData.username &&
                                            <div className="avatar">{chat.senderName}</div>}
                                        <div className="message-data">{chat.message}</div>
                                        {chat.senderName === userData.username &&
                                            <div className="avatar self">{chat.senderName}</div>}
                                    </li>
                                ))}
                            </ul>

                            <div className="send-message">
                                <input type="text" className="input-message" placeholder="enter the message"
                                       value={userData.message} onChange={handleMessage}/>
                                <button type="button" className="send-button" onClick={sendValue}>send</button>
                            </div>
                        </div>}
                        {tab !== "CHATROOM" && <div className="chat-content">
                            <ul className="chat-messages">
                                {[...privateChats.get(tab)].map((chat, index) => (
                                    <li className={`message ${chat.senderName === userData.username && "self"}`}
                                        key={index}>
                                        {chat.senderName !== userData.username &&
                                            <div className="avatar">{chat.senderName}</div>}
                                        <div className="message-data">{chat.message}</div>
                                        {chat.senderName === userData.username &&
                                            <div className="avatar self">{chat.senderName}</div>}
                                    </li>
                                ))}
                            </ul>

                            <div className="send-message">
                                <input type="text" className="input-message" placeholder="enter the message"
                                       value={userData.message} onChange={handleMessage}/>
                                <button type="button" className="send-button" onClick={sendPrivateValue}>send</button>
                            </div>
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