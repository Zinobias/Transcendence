
import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Chat from './Chat'
import Leaderboard from './Leaderboard';
import Game from './Game'
import ChatWindow from './ChatWindow';
import NavBar from './NavBar';

const Routing: React.FC  = () => {
    
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