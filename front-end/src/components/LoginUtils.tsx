import React, { useEffect, useContext, useState } from "react";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { SocketContext } from "./Socket";

export const   LogoutButton: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie, removeCookie] = useCookies(['user', 'userID']);

    // eventn listener to remove cookies and log user out
    useEffect(() => {
        socket.on("logout", response => {
            removeCookie('user');
            removeCookie('userID');
        })

        return () => {
            socket.off("logout");
        }
    }, [])

    const handleLogout = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        // console.log("click logout");
        socket.emit("logout", {
            userId: cookies.userID,
            authToken: cookies.user
        });
        removeCookie('user');
        removeCookie('userID');
    };

    return (
        <div>
            <button className="logoutButton" onClick={(e) => handleLogout(e)}>LOGOUT</button>
        </div>
    )
};

export const    SignupButton: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string>("");
    const [signup, setSignup] = useState<string>("");

    // EVENT LISTENERS
    useEffect(() => {
        socket.on("create_account", response => {
            if (response.success == false) {
                // console.log("Create Account went wrong");
                searchParams.delete("code");
                setSearchParams(searchParams);
                alert(response.msg);
            }
            else {
                // console.log("socket.on create_acconut " + response.DTO.auth_cookie);
                // console.log("socket.on create_acocunt " + response.DTO.user_id);
                setCookie('user', response.DTO.auth_cookie, {path: '/'});
                setCookie('userID', response.DTO.user_id, {path: '/'});
                navigate('/');
            }
        })

        socket.on('retrieve_redirect', response => {
            setSignup(signip => response.signup);
        })

        return () => {
            socket.off('retrieve_redirect');
            socket.off("create_account");
        }
    }, [])

    // ON MOUNT
    useEffect(() => {
        if (searchParams.get("code")) {
            // console.log("emitting create_account " + sessionStorage.getItem("userName"));
            socket.emit("auth", {
                eventPattern: "create_account", 
                data: {
                    token: searchParams.get("code"), 
                    userName: sessionStorage.getItem("userName")
                }
            });
            sessionStorage.clear();
        }

        socket.emit('retrieve_redirect', {});
    }, [])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        if (userName) {
            // console.log("Redirecting signup " + userName);
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
            <br/><span>Already have an account? Go to <Link to="/login" style={{ textDecoration: "none", color: "black" }}><b>Login!</b></Link></span>
        </>
    )
};


export const    LoginButton: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const socket = useContext(SocketContext);
    const [login, setLogin] = useState<string>("");
    const [token, setToken] = useState<string>("");
    const [showTwoFA, setShowTwoFA] = useState<boolean>(false);

    // EVENT LISTENERS
    useEffect(() => {
        socket.on("login", response => {
            if (response.success == false) {
                // console.log("Login went wrong");
                searchParams.delete("code");
                setSearchParams(searchParams => searchParams);
                alert(response.msg);
            }
            else if (response.success == true && !response.DTO.auth_cookie) {
                // console.log("socket.on login success setting up 2fa");
                if (sessionStorage.getItem("2fa")) {
                    alert("The Token you entered was invalid");
                    searchParams.delete("code");
                    setSearchParams(searchParams => searchParams);
                }
                else {                    
                    sessionStorage.setItem("2fa", "2fa");
                    window.dispatchEvent(new Event("storage"));
                }
            }
            else if (response.success == true && response.DTO.auth_cookie) {
                // console.log("socket.on login " + response.DTO.auth_cookie);
                // console.log("socket.on login " + response.DTO.user_id);
                sessionStorage.clear();
                setCookie('user', response.DTO.auth_cookie, {path: '/'});
                setCookie('userID', response.DTO.user_id, {path: '/'});
                navigate('/');
            }
        })
        socket.on('retrieve_redirect', response => {
            setLogin(login => response.login);
        })
        return () => {
            socket.off('retrieve_redirect');
            socket.off('login');
        }
    }, [])

    // ON MOUNT
    useEffect(() => {
        if (searchParams.get("code") && sessionStorage.getItem("token")) {
            socket.emit("auth", {
                eventPattern: "login", 
                data: {token: searchParams.get("code"), TFAToken: sessionStorage.getItem("token")}
            });
        }
        else if (searchParams.get("code") && !sessionStorage.getItem("token")) {
            socket.emit("auth", {
                eventPattern: "login", 
                data: {token: searchParams.get("code")}
            });
        }

        if (sessionStorage.getItem("2fa")) {
            setShowTwoFA(showTwoFA => true)
        }

        socket.emit('retrieve_redirect', {});
    }, [])

    // Session Storage Listener
    useEffect(() => {
        function checkUserData() {
            if (sessionStorage.getItem("2fa")) {
                setShowTwoFA(showTwoFA => true)
            }
        }
        window.addEventListener('storage', checkUserData)
        return () => {
            window.removeEventListener('storage', checkUserData)
        }
      }, [])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        window.location.href = login;
        // sessionStorage.clear();
    };
    
    const handleTwoFA = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        sessionStorage.setItem("token", token);
        setToken("");
        window.location.href = login;
        // sessionStorage.clear();
    }

    if (showTwoFA) {
        return (
            <div className="loginButtonDIV">
                <input type="input" value={token} onChange={(e)=> setToken(e.target.value)} className="loginTwoFA_input"/>
                <button className="loginButton" onClick={(e) => handleTwoFA(e)}>submit 2fa token</button>
            </div>
        )
    }

    return (
        <div className="loginButtonDIV">
            <button className="loginButton" id="loginButton" onClick={(e) => handleClick(e)}>LOGIN</button>
            <br/><span>Not signed up yet? Create an <Link to="/signup" style={{ textDecoration: "none", color: "black" }}><b>Account!</b></Link></span>
        </div>
    )
};
