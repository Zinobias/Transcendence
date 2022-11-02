import React, { createContext } from "react";
import socketIOClient from "socket.io-client";

export const gameSocket = socketIOClient("http://localhost:8084");
export const GameSocketContext = createContext(gameSocket);
export const chatSocket = socketIOClient("http://localhost:8082");
export const ChatSocketContext = createContext(chatSocket);
export const authSocket = socketIOClient("http://localhost:8081");
export const AuthSocketContext = createContext(authSocket);
