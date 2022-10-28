import React, { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { SocketContext } from "./Socket";
import '../App.css'
import './Components.css';

/*
    NOTES
    <input type="password" placeholder="password"/>
*/

const   Login: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cookies, setCookie] = useCookies(['user']);
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on("user_id", res => {
            console.log(res.auth_cookie);
            setCookie('user', res.auth_cookie, {path: '/'});
            navigate('/');
        })
    }, [])
    
    if (searchParams.get("code")) {
        console.log("EMITTING")
        socket.emit("auth", { code: searchParams.get("code") })
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-97cf4334b48e0666383ad5f7509c011b62e838ecb24c7b90a2b38cf2594759d7&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code'
    };

    return  (
        <div className="grid-container">
            <span className="grid__header">Disco Pong</span>      
            <div className="grid__body">
                <button className="loginform__button" onClick={(e) => handleLogin(e)}>LOGIN</button>
            </div>
        </div>
      )
};

export default Login;