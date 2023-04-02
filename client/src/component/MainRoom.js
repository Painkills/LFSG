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
        label: '',
        connected: false,
        message: ''
    });


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
                <form>
                    <label htmlFor="username">Username:</label>
                    <input type="text" name="username" id="username" required/>

                        <label htmlFor="password">Password:</label>
                        <input type="password" name="password" id="password" required/>

                            <label htmlFor="confirm_password">Confirm Password:</label>
                            <input type="password" name="confirm_password" id="confirm_password" required/>

                                <input type="submit" value="Submit" onClick={(event) => validateForm(event)}/>
                </form>
            </div>
        )
    }
    if (registerPage === false) {
        return (
            // Raid Room Area
            <div className="container">
                {userData.connected?

                    // If the user IS connected...
                    <div>
                        <div>
                            <Link to='/room' state = {{
                                roomId: "111",
                                username: userData.username
                            }}> Go to Raid Room 111
                            </Link>
                        </div>
                        <div>
                            <Link to='/room' state = {{
                                roomId: "112",
                                username: userData.username
                            }}> Go to Raid Room 112
                            </Link>
                        </div>

                    </div>

                    :

                    // If not, then show them the sign in screen
                    <div className="intro">
                        <h1>Welcome Raider!</h1>
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

                            <button type="button" onClick={register}>
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