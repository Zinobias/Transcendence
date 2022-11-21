
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
            <button className="logoutButton" onClick={(e) => handleLogout(e)}>LOGOUT</button>
        </div>
    )
};

export const    SignupButton: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const [userName, setUserName] = useState<string>("");
    const [signup, setSignup] = useState<string>("");
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on("create_account", response => {
            if (response.success == false) {
                console.log("Create Account went wrong");
                searchParams.delete("code");
                setSearchParams(searchParams);
                alert(response.msg);
            }
            else {
                console.log("socket.on create_acconut " + response.DTO.auth_cookie);
                console.log("socket.on create_acocunt " + response.DTO.user_id);
                setCookie('user', response.DTO.auth_cookie, {path: '/'});
                setCookie('userID', response.DTO.user_id, {path: '/'});
                navigate('/');
            }
        })
        socket.on('retrieve_redirect', response => {
            setSignup(response.signup);
        })
        return () => {
            socket.off('retrieve_redirect');
            socket.off("create_account");
        }
    }, [])

    useEffect(() => {
        if (searchParams.get("code")) {
            console.log("emitting create_account " + sessionStorage.getItem("userName"));
            socket.emit("auth", {
                eventPattern: "create_account", 
                data: {
                    token: searchParams.get("code"), 
                    userName: sessionStorage.getItem("userName")
                }
            });
            sessionStorage.clear();
        }
    }, [])

    useEffect(() => {
        socket.emit('retrieve_redirect', {});
    }, [])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (userName) {
            console.log("Redirecting signup " + userName);
            sessionStorage.setItem("userName", userName);
            window.location.href = signup;
        }
        else {
            alert("Name Field is required");
        }
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
    const [login, setLogin] = useState<string>("");

    useEffect(() => {
        socket.on("login", response => {
            if (response.success == false) {
                console.log("Login went wrong");
                searchParams.delete("code");
                setSearchParams(searchParams);
                alert(response.msg);
            }
            else {
                console.log("socket.on login " + response.DTO.auth_cookie);
                console.log("socket.on login " + response.DTO.user_id);
                setCookie('user', response.DTO.auth_cookie, {path: '/'});
                setCookie('userID', response.DTO.user_id, {path: '/'});
                navigate('/');
            }
        })
        socket.on('retrieve_redirect', response => {
            setLogin(response.login);
        })
        return () => {
            socket.off('retrieve_redirect');
            socket.off('login');
        }
    }, [])

    useEffect(() => {
        if (searchParams.get("code")) {
            console.log("emitting login " + searchParams.get("code"));
            socket.emit("auth", {
                eventPattern: "login", 
                data: {token: searchParams.get("code")}
            });
        }
    }, [])

    useEffect(() => {
        socket.emit('retrieve_redirect', {});
    }, [])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        console.log("REDIRECTING LOGIN");
        window.location.href = login;
    };

    return (
        <>
            <button className="defaultButton" onClick={(e) => handleClick(e)}>LOGIN</button>
        </>
    )
};

export const DefaultMatchmaking: React.FC = () => {

    const [state, setState] = useState<boolean>(false);

    useEffect(() => {
        if (state)
            console.log("emitting default");
        //socke.emit
    }, [state])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setState(true);
        console.log("click default");
    };

    return (
        <>
            <button className="boringButton" onClick={(e) => handleClick(e)}>DEFAULT</button>
        </>
    )

};

export const DiscoMatchmaking: React.FC = () => {

    const [state, setState] = useState<boolean>(false);

    useEffect(() => {
        if (state)
            console.log("emitting disco");
        //socket.emit
    }, [state])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setState(true);
        console.log("click disco");
    };

    return (
        <>
            <button className="defaultButton" onClick={(e) => handleClick(e)}>DISCO</button>
        </>
    )
};

