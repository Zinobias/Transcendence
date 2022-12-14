import React, { createContext } from "react";
import socketIOClient from "socket.io-client";

export const socket = socketIOClient("http://192.168.2.16:8084");
export const SocketContext = createContext(socket);