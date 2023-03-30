import React, { useEffect, useState } from 'react'
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import RaidRoom from './RaidRoom'

let stompClient =null;

const MainScreen = () => {
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
}

export default MainScreen