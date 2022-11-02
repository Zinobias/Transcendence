
import React, { useContext, useState } from 'react'
import { Routes, Route, useSearchParams } from 'react-router-dom';
import Login from './Login';
import Chat from './Chat'
import Leaderboard from './Leaderboard';
import Game from './Game'
import ChatWindow from './ChatWindow';
import NavBar from './NavBar';
import { GameSocketContext } from "./Socket";
import { useCookies } from 'react-cookie';

const Routing: React.FC  = () => {
    const [cookies, setCookie] = useCookies(['user']);
    const socket = useContext(GameSocketContext);

    return (
        // STILL NEED TO WRITE PROPER GUARD
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