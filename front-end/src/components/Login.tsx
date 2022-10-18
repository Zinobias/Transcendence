import React, { useState } from "react";
import { render } from "react-dom";
import { useNavigate } from 'react-router-dom';
import App from "../App";
import '../App.css'
import './Components.css';

/*
    NOTES

    <input type="password" placeholder="password"/>
*/

const   Login: React.FC = () => {
    const [user, setUser] = useState<string>("");
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        //sessionStorage.setItem("user", user);
        navigate('/discopong');
    };

    // if (sessionStorage.getItem("user")) {
    //     navigate('/discopong');
    // }

    return (
        <div className="app"> 
            <span className="heading">Disco Pong</span>  
            <form className="loginform">
                <label className="loginform__label">Username</label>
                <input value={user} onChange={e => setUser(e.target.value)} className="loginform__input"/>
                <button className="loginform__button" onClick={(e) => handleLogin(e)}>LOGIN</button>
            </form>     
        </div>
      )

};

export default Login;