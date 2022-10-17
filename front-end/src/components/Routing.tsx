
import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Chat from './Chat'
import Profile from './Profile'
import Game from './Game'
import ChatWindow from './ChatWindow';

const Routing: React.FC  = () => {
    return (
        <Routes>
            <Route path='/chat' element={<Chat />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/game' element={<Game />} />
            <Route path='/chat_window' element={<ChatWindow />} />
      </Routes>
    )
};

export default Routing;