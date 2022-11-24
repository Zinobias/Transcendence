import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import { useNavigate} from 'react-router-dom';
import { Chatroom, IChannel } from "../interfaces"
import ListChatrooms from "./ListChatrooms";
import './Components.css';
import {Md5} from "ts-md5";

const   Chat: React.FC = () => {
	
	const socket = useContext(SocketContext);
	const navigate = useNavigate()
    const [cookies] = useCookies(['userID', 'user']);
    const [chatroomName, setChatroomName] = useState<string>("");
    const [visibleCheck, setVisibleCheck] = useState<boolean>(false);
    const [passwordCheck, setPasswordCheck] = useState<boolean>(false);
    const [channels, setChannels] = useState<IChannel[]>([]);

    useEffect(() => {
        socket.on("channel_create", response => {
            console.log(`socket.on channel_create ${response.channel_name}`);
        })

        socket.on("channels_retrieve", response  => {
            console.log(`socket.on channels_retrieve`);
            console.log(`return response ${response.channels[0]}`);
            // response.channels.forEach((element : IChannel) => {
            //     console.log(element.channelName);
            // });
        })

        return () => {
            socket.off("channel_create");
            socket.off("channels_retrieve");
        }
    },[])

    var chats: Chatroom[] = [
        {name: "chat 1", id: 1},
        {name: "chat 2", id: 2, password: true},
        {name: "chat 3", id: 3, password: true},
        {name: "chat 4", id: 4},
    ];

    const handleVisible = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVisibleCheck(!visibleCheck);  
    };

    const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordCheck(!passwordCheck);
    }

    function validateChatroomName (name: string) : boolean {
        const regExp = new RegExp(`[^a-zA-Z0-9_]`, 'g');
        const match = name.matchAll(regExp);
        const result = match.next().value;

        if (!name) {
            alert("Name Field is required");
            return (false);
        }
        if (name.length > 12) {
            alert("Channel Name needs to be between 3-12 characters");
            return (false);
        }
        if (result != undefined) {
            alert(`[${result}] is an invalid character`);
            return (false);
        }
        return (true);
    }

    const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

        if (validateChatroomName(chatroomName)) {
            //TODO implement has for password, below is an example of how to hash something, just append the channel id to the end of the password
            // console.log(Md5.hashStr(chatroomPassword + chatroomId))

            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "channel_create", 
                data: { user_id: cookies.userID, 
                        channel_name: chatroomName, 
                        creator2_id: undefined, 
                        visible: visibleCheck, 
                        should_get_password: passwordCheck }
            });
            console.log(`emiting channel_create name:[${chatroomName}] visible:[${visibleCheck}] password:[${passwordCheck}]`);
        }
        // console.log(`name:[${chatroomName}] visible:[${visibleCheck}] password:[${passwordCheck}]`);
        setChatroomName("");
        setVisibleCheck(false);
        setPasswordCheck(false);
    };

    const handleRetrieve = (e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channels_retrieve",
            data: {user_id: cookies.userID}
        })

        console.log("emiting channels_retrieve");
    };

    return (
        <>
        <div>
            <span className="heading__small">OPEN CHATROOMS PLACEHOLDER</span>
            <ListChatrooms chatroom={chats} />
        </div>
        <form className="loginform" id="newChatroom">
                <label className="loginform__label">Name</label>
                <input type="input" value={chatroomName} onChange={(e)=>setChatroomName(e.target.value)} className="loginform__input"/>
                <label className="loginform__label">password</label>
                <input type="checkbox" checked={passwordCheck} onChange={e => setPasswordCheck(!passwordCheck)}/>
                <label className="loginform__label">public</label>
                <input type="checkbox" checked={visibleCheck} onChange={e => setVisibleCheck(!visibleCheck)}/>
                <button className="loginform__button" onClick={(e) => handleSubmit(e)}>NEW CHATROOM</button>
        </form>
        <button className="defaultButton" onClick={(e) => handleRetrieve(e)}>retrieve channels</button>
        </>
    )
    
};

export default Chat;
