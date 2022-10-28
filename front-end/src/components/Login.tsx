import React, { useState } from "react";
import {redirect, useNavigate} from 'react-router-dom';
import '../App.css'
import './Components.css';

/*
    NOTES
    <input type="password" placeholder="password"/>
*/

const   Login: React.FC = () => {
    const [user, setUser] = useState<string>("");
    const [token, setToken] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        // window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-97cf4334b48e0666383ad5f7509c011b62e838ecb24c7b90a2b38cf2594759d7&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code'
        sessionStorage.setItem("user", user);
        console.log(sessionStorage.getItem("user"));
        setToken(true);
        navigate('/discopong');
    };

    // if (token == true) {
    //     navigate('/discopong');
    // }

    return  (
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