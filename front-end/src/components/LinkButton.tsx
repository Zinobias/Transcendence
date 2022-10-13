
import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Chat from './Chat'
import Profile from './Profile'
import Game from './Game'

const LinkButton: React.FC  = () => {
    return (
        <Routes>
            <Route path='/chat' element={<Chat />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/game' element={<Game />} />
      </Routes>
    )
};

export default LinkButton;