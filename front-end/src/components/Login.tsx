import React from "react";
import './Components.css';
import { useAuth0 } from '@auth0/auth0-react';

/*
    NOTES

    <input type="password" placeholder="password"/>
*/

interface Props {
    setmyBool: React.Dispatch<React.SetStateAction<boolean>>;
}

const   Login: React.FC<Props> = ({setmyBool}) => {
    
    return (
        <> 
            <span className="dheading">Disco Pong</span>
            <form className="loginform">
                <label className="loginform__label">Email</label>
                <input type="text" placeholder="email" className="loginform__input"/>
                <label className="loginform__label">password</label>
                <input type="text" placeholder="password" className="loginform__input"/>
                <button className="loginform__button" onClick={() => setmyBool(false)}>LOGIN</button>
            </form>
        </>
      )
};

export default Login;