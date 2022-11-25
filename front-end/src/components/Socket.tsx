import React, { createContext } from "react";
import socketIOClient from "socket.io-client";

export const socket = socketIOClient("http://[2a02:a45b:7f00:1:1593:3381:3da:3ba7]:8084");
export const SocketContext = createContext(socket);