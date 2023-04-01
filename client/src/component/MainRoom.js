import React, { useState } from 'react'
import { Link } from "react-router-dom";

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

    const register = () => {
        setUserData({...userData,"connected": true});
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