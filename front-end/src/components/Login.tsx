import React from "react";
import { useNavigate} from 'react-router-dom';
import { LoginButton, SignupButton } from "./Buttons";
import '../App.css'
import './Components.css';

/*
    NOTES
    <input type="password" placeholder="password"/>
*/

const   Login: React.FC = () => {
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        navigate('/signup');
    };

    return  (
        <div className="grid-container">
            <span className="grid__header">Disco Pong</span>      
            <div className="grid__body">
                <LoginButton/>
                {/* <SignupButton/> */}
                <br/>
                <p>or</p>
                <button className="defaultButton" onClick={(e) => handleClick(e)}>Sign Up</button>
            </div>
        </div>
      )
};

export default Login;