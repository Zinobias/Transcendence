
import React, { useEffect, useContext, useState } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { SocketContext } from "./Socket";

export const   LogoutButton: React.FC = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['user', 'userID']);

    const handleLogout = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        removeCookie('user');
        removeCookie('userID')
        console.log("click logout");
    };

    return (
        <div>
            <button className="loginform__button" onClick={(e) => handleLogout(e)}>LOGOUT</button>
        </div>
    )
};

export const    AccountButton: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const [userName, setUserName] = useState<string>("");
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on("create_account", res => {
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
            socket.emit("auth", {
                eventPattern: "create_account", 
                data: {
                    token: searchParams.get("code"), 
                    userName: "panini"
                }
            });
        }
        console.log("userName " + userName);
    }, [])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        console.log("REDIRECTING " + userName);
        window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-dc4d066a92ebb003a5fa223b28af0bd6f27c6943eb7a2d20ea6ae42a75cd508c&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin&response_type=code'
    };

    return (   
        <>
            <form className="loginform">
                <label className="loginform__label">Name</label>
                <input type="input" onChange={(e)=>setUserName(e.target.value)} placeholder="name" className="loginform__input"/>
                <button className="loginform__button"  onClick={(e) => handleClick(e)}>CREATE ACCOUNT</button>
            </form>
        </>
    )
};


export const    LoginButton: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const socket = useContext(SocketContext);

    useEffect(() => {
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
            console.log("EMITTING LOGIN " + searchParams.get("code"));
            socket.emit("auth", {
                eventPattern: "login", 
                data: {token: searchParams.get("code")}
            });
        }
    }, [])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        console.log("REDIRECTING LOGIN");
        window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-dc4d066a92ebb003a5fa223b28af0bd6f27c6943eb7a2d20ea6ae42a75cd508c&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin&response_type=code'
    };

    return (
        <>
            <button className="defaultButton" onClick={(e) => handleClick(e)}>LOGIN</button>
        </>
    )
};

//export default LogoutButton; 
