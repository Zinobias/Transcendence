import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
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
        // sessionStorage.setItem("user", user);
        navigate('/discopong');
    };

    // if (sessionStorage.getItem("user")) {
    //     navigate('/discopong');
    // }

    return (
        <div className="grid-container">
            <span className="grid__header">Disco Pong</span>      
            <div className="grid__login">
                <form className="loginform">
                    <label className="loginform__label">Username</label>
                    <input value={user} onChange={e => setUser(e.target.value)} className="loginform__input"/>
                    <button className="loginform__button" onClick={(e) => handleLogin(e)}>LOGIN</button>
                </form>     
            </div>
        </div>
      )

};

export default Login;