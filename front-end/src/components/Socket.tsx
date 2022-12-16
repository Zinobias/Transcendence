import React, { createContext } from "react";
import socketIOClient from "socket.io-client";

export const socket = socketIOClient("http://localhost:8084");
export const SocketContext = createContext(socket);