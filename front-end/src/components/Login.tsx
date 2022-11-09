import React, { useEffect, useContext, useState } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { SocketContext } from "./Socket";
import '../App.css'
import './Components.css';
import { SocketAddress } from "net";

/*
    NOTES
    <input type="password" placeholder="password"/>
*/

const   Login: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const [userName, setUserName] = useState<string>("");
    const [isCreate, setIsCreate] = useState<boolean>(false);
    const socket = useContext(SocketContext);

    // WITH BACKEND
    //console.log(isCreate);

    useEffect(() => {
        socket.on("create_account", res => {
            console.log(res.auth_cookie);
			console.log(res.user_id);
            setCookie('user', res.auth_cookie, {path: '/'});
            setCookie('userID', res.user_id, {path: '/'});
            navigate('/');
        })

        socket.on("login", res => {
            console.log(res.auth_cookie);
			console.log(res.user_id);
            setCookie('user', res.auth_cookie, {path: '/'});
            setCookie('userID', res.user_id, {path: '/'});
            navigate('/');
        })

    }, [])

    useEffect(() => {
        if (searchParams.get("code")) {
            console.log("EMITTING " + userName);
            // isCreate === true
            // ? socket.emit("auth", {eventPattern: "create_account", payload: {token: searchParams.get("code"), userName: userName}}) 
            // : socket.emit("auth", {eventPattern: "Login", payload: {token: searchParams.get("code")}});
            
            socket.emit("auth", {eventPattern: "login", payload: {token: searchParams.get("code")}});
            // socket.emit("auth", {eventPattern: "create_account", payload: {token: searchParams.get("code"), userName: "panini"}});
            
            setIsCreate(false);
        }
    }, [])
    
    //WITHOUT BACKEND
    // useEffect(() => {
    //     if (searchParams.get("code")) {
    //         setCookie('user', searchParams.get("code"), {path: '/'});
    //         navigate('/');
    //     }
    // }, [])

    const handleLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-dc4d066a92ebb003a5fa223b28af0bd6f27c6943eb7a2d20ea6ae42a75cd508c&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code'
    };

    const handleCreate = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        console.log(userName);
        setIsCreate(true);
        console.log("REDIRECTING " + isCreate);
        window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-dc4d066a92ebb003a5fa223b28af0bd6f27c6943eb7a2d20ea6ae42a75cd508c&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code'
    };

    return  (
        <div className="grid-container">
            <span className="grid__header">Disco Pong</span>      
            <div className="grid__body">
                <button className="loginform__button" onClick={(e) => handleLogin(e)}>LOGIN</button>
                <br/><br/>
                <form className="loginform">
                    <label className="loginform__label">Name</label>
                    <input type="input" onChange={(e)=>setUserName(e.target.value)} placeholder="name" className="loginform__input"/>
                    <button className="loginform__button"  onClick={(e) => handleCreate(e)}>CREATE ACCOUNT</button>
                </form>
            </div>
        </div>
      )
};

export default Login;