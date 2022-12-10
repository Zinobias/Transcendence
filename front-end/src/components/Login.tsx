import React, { useEffect, useState } from "react";
import { useNavigate} from 'react-router-dom';
import { LoginButton } from "./LoginUtils";
import '../App.css'
import './Components.css';

/*
    NOTES
    <input type="password" placeholder="password"/>
*/

const   Login: React.FC = () => {
    const navigate = useNavigate();
    const [signUp, setSignUp] = useState<boolean>(true);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        navigate('/signup');
    };

    // Session Storage Listener
    useEffect(() => {
        function checkSessionData() {
            if (sessionStorage.getItem("2fa")) 
                setSignUp(signUp => false)
        }
        window.addEventListener('storage', checkSessionData)
        return () => {
            window.removeEventListener('storage', checkSessionData)
        }
    }, [])

    return  (
        <div className="grid-container">
            <span className="grid__header">Disco Pong</span>      
            <div className="grid__body">
                <LoginButton/>
                {   
                    signUp &&
                    <><br/><p>or</p>
                    <button className="defaultButton" onClick={(e) => handleClick(e)}>Sign Up</button></>   
                }
            </div>
        </div>
      )
};

export default Login;