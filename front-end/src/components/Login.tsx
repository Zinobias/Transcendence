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

    // WITH BACKEND
    // useEffect(() => {
    //     socket.on("user_id", res => {
    //         console.log(res.auth_cookie);
	// 		console.log(res.user_id);
    //         setCookie('user', res.auth_cookie, {path: '/'});
    //         navigate('/');
    //     })
    // }, [])
    
    // if (searchParams.get("code")) {
    //     console.log("EMITTING")
    //     socket.emit("auth", { code: searchParams.get("code") })
    // }

    //WITHOUT BACKEND
    useEffect(() => {
        if (searchParams.get("code")) {
            setCookie('user', searchParams.get("code"), {path: '/'});
            navigate('/');
        }
    }, [])

    const handleLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-dc4d066a92ebb003a5fa223b28af0bd6f27c6943eb7a2d20ea6ae42a75cd508c&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code'
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