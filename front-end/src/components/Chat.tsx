import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import { IChannel } from "../interfaces"
import './Components.css';
import {Md5} from "ts-md5";
import ListPublicChatrooms from "./ListPublicChatrooms";

const   Chat: React.FC = () => {
	
	const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    const [state, setState] = useState<boolean>(false);
    const [chatroomName, setChatroomName] = useState<string>("");
    const [visibleCheck, setVisibleCheck] = useState<boolean>(false);
    const [passwordCheck, setPasswordCheck] = useState<boolean>(false);
    const [channels, setChannels] = useState<IChannel[]>([]);

    useEffect(() => {
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channels_retrieve",
            data: {user_id: cookies.userID}
        })
        console.log("emiting channels_retrieve");
    }, [state])

    useEffect(() => {
        socket.on("channel_create", response => {
            console.log(`socket.on channel_create ${response.channel_name}`);
            setState(!state);
        })

        socket.on("channels_retrieve", response  => {
            console.log(`socket.on channels_retrieve`);
            setChannels([]);
            response.channels.forEach((element : IChannel) => {
                setChannels( channels => [...channels, element])
            });
            // setChannels([...channels, response.channels]);
        })

        return () => {
            socket.off("channel_create");
            socket.off("channels_retrieve");
        }
    },[])

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

    return (
        <>
        <div>
            <span className="heading__small">OPEN CHATROOMS PLACEHOLDER</span>
            <ListPublicChatrooms chatroom={channels} />
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
        </>
    )
    
};

export default Chat;
