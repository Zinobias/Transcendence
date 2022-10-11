
import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Task from './DiscoPong'
import App from '../App'

const LinkButton: React.FC  = () => {
    return (
        <Routes>
            <Route path='/task' element={<Task />} />
      </Routes>
    )
};

export default LinkButton;