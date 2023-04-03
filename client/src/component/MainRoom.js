import React, {useEffect, useState} from 'react'
import { Link } from "react-router-dom";
import SockJS from "sockjs-client";
import {over} from "stompjs";

let stompClient =null;


const RaidRoom = () => {


    // STATES
    const [registerPage, setRegisterPage] = useState(false);
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
        email: '',
        label: '',
        connected: false,
        message: ''
    });
    const [nickNameData, setNickNameData] = useState({
        nickname: '',
    });


    // LOGIN METHODS
    const handleEmail=(event)=>{
        const {value} = event.target;
        setUserData({...userData,"email": value});
    }
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

const logInAttempt=()=>{
        window.location.href = "http://localhost:8082/students/loginAttempt?email="+ userData.email + "&password=" + userData.password;
    }

    const register = () => {
        setUserData({...userData,"connected": true});
    }



    // ===================== ACTUAL RENDERED PAGE BELOW THIS POINT ==================
    if(registerPage === true){
        function validateForm(event) {
            var password = document.getElementById("password").value;
            var confirm_password = document.getElementById("confirm_password").value;

            if (password !== confirm_password) {
                alert("Passwords do not match");
                event.preventDefault();
            }
        }
        return(
            <div className="app">
                <form method={"POST"} action={"http://localhost:8082/students/registering"}>
                    <label htmlFor="user-fname">First Name:</label><br/>
                    <input type="text" name="user-fname" id="user-fname" required/>
                    <br/>
                    <label htmlFor="user-lname">Last Name:</label><br/>
                    <input type="text" name="user-lname" id="user-lname" required/>
                    <br/>
                        <label htmlFor="password">Password:</label><br/>
                        <input type="password" name="password" id="password" required/>
                    <br/>
                            <label htmlFor="confirm_password">Confirm Password:</label><br/>
                            <input type="password" name="confirm_password" id="confirm_password" required/>
                    <br/>
                                <label htmlFor="Email">Email:</label><br/>
                                <input type="email" name="email" id="email" required/>
                    <br/>
                                <input type="submit" value="Submit" onClick={(event) => validateForm(event)}/>
                </form>
            </div>
        )
    }
    var trueOrFalse;
    var avatarId;
    if (registerPage === false) {

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            const params = new URLSearchParams(window.location.search);
            trueOrFalse = params.get('login');
            setNickNameData(({...nickNameData,"nickname": params.get('fullName')}));
            if (trueOrFalse === "true") {

                register();
            }
        }, []);
        return (
            // Raid Room Area
            <div className="container">
                {userData.connected?

                    // If the user IS connected...
                    <div id="room-select">
                        <div className="room">
                            <Link to='/room' state = {{
                                roomId: "111",
                                username: nickNameData.nickname
                            }}> Go to Raid Room 111
                            </Link>
                        </div>
                        <div className="room">
                            <Link to='/room' state = {{
                                roomId: "112",
                                username: nickNameData.nickname
                            }}> Go to Raid Room 112
                            </Link>
                        </div>

                    </div>

                    :

                    // If not, then show them the sign in screen
                    <div className="intro">
                    <h1><b>Welcome Raider!</b></h1>
                    <div className="register">
                    <input
                    id="user-email"
                    placeholder="Enter your email"
                    name="Email"
                    value= {userData.email}
                    onChange={handleEmail}
                    />
                    <input
                    id="user-pass"
                    placeholder="Enter your password"
                    name="password"
                    value={userData.password}
                    onChange={handlePassword}
                    />

                    <button type="button" onClick={logInAttempt}>
                    Sign in
                    </button>
                    <button type="button" onClick={onChangeRegisterPage}>
                    Register
                    </button>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default RaidRoom