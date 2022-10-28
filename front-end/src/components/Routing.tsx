
import React, { useContext, useState } from 'react'
import { Routes, Route, useSearchParams } from 'react-router-dom';
import Login from './Login';
import Chat from './Chat'
import Leaderboard from './Leaderboard';
import Game from './Game'
import ChatWindow from './ChatWindow';
import NavBar from './NavBar';
import { SocketContext } from "./Socket";
import { useCookies } from 'react-cookie';


export class AuthData {
    constructor(code: string) {
        this.code = code;
    }
    code: string;
}

const Routing: React.FC  = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['user']);
    const socket = useContext(SocketContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [authData, setAuthData] = useState<string>("");

    // if (searchParams.get("code") && !cookies.user) {
    //     setCookie('user', searchParams.get("code"), {path: '/'});
    // }

    // let b = window.location.href.includes("?code");
    // if (b) {
    //     let number = window.location.href.lastIndexOf("code=");
    //     let str = window.location.href.substring(number + 5);
    //     let authData = new AuthData(str);
    //     console.log(authData.code)
    //     console.log("EMITTING")
    //     socket.on("user_id", res => {
    //         console.log(res.auth_cookie);
    //     })
    //     socket.emit("auth", { code: authData.code })
    // }

    return (
        //still need to write proper guard
        <Routes>
            <Route path='/Login' element={cookies.user ? <NavBar /> : <Login />}/>
            <Route path='/' element={!cookies.user ? <Login /> : <NavBar />}>
            {/* <Route path='/' element={<NavBar />}>    */}
                <Route index element={<Leaderboard />} />
                <Route path='leaderboard' element={<Leaderboard />} />
                <Route path='game' element={<Game />} />
                <Route path='chat' element={<Chat />} />
                <Route path='chat/chat_window' element={<ChatWindow />} />
                {/* <Route path='chat' element={<Chat />}>
                    <Route path='chat_window' element={<ChatWindow />} />
                </Route> */}
            </Route>

        </Routes>
    )
};

export default Routing;