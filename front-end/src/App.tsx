import React, { ReactNode, useState, useEffect } from 'react';
import socketIOClient from "socket.io-client";
import './App.css';
import { Link} from 'react-router-dom';
import LinkButton from './components/LinkButton';
import Task from './components/DiscoPong';
import DiscoPong from './components/DiscoPong';


const ENDPOINT = "http://chat-app:8080";

const App: React.FC = () => {

  const [myBool, setmyBool] = useState(true);
  const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("msgToClient", data => {
      socket.emit("msgToServer", "test");
      console.log(data);
      setResponse(data);
    });
  }, []);

  function toggleBool() {
    setmyBool(!myBool)
  }

  return (
    <div className="App"> 
    {myBool ? <Landing toggleBool={toggleBool} /> : <DiscoPong /> }
    </div>
  );
}

function Landing(props: any){
  return (
    <div className="App"> 
      <h1>Welcome</h1>
      <form className="register-form" />
      <input type="text" placeholder="name"/>
      <input type="password" placeholder="password"/>
      <button onClick={props.toggleBool}>GO</button>
    </div>
  )
}

export default App;
