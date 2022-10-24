
import React, {useContext} from 'react'
import {Routes, Route, useParams} from 'react-router-dom';
import Login from './Login';
import Chat from './Chat'
import Leaderboard from './Leaderboard';
import Game from './Game'
import ChatWindow from './ChatWindow';
import NavBar from './NavBar';
import {SocketContext} from "./Socket";
export class AuthData {
    constructor(code: string) {
        this.code = code;
    }
    code: string;
}
const Routing: React.FC  = () => {
    const socket = useContext(SocketContext);
    let b = window.location.href.includes("?code");
    if (b) {
        let number = window.location.href.lastIndexOf("code=");
        let str = window.location.href.substring(number + 5);
        let authData = new AuthData(str);
        console.log(authData.code)
        console.log("EMITTING")
        socket.emit("auth", { code: authData.code })
    }

    return (
        <Routes>
            <Route path='/' element={<Login />} />
            {/* <Route path='/discopong' element={!sessionStorage.getItem("user") ? <Login /> : <NavBar />}> */}
            <Route path='/discopong' element={<NavBar />}>   
                <Route index element={<Leaderboard />} />
                <Route path='leaderboard' element={<Leaderboard />} />
                <Route path='game' element={<Game />} />
                <Route path='chat' element={<Chat />}>
                    <Route path='chat_window' element={<ChatWindow />} />
                </Route>
            </Route>

        </Routes>
    )
};

export default Routing;