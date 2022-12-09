import React, { useState, useRef, useEffect, useContext }  from "react";
import { useCookies } from "react-cookie";
import { IChannel, IMessage } from "../interfaces";
import ChatInput from "./ChatInput";
import { SocketContext } from "./Socket";
import { AiOutlineMenu } from "react-icons/ai";
import { convertToObject } from "typescript";

interface Props {
    channel: IChannel;
    updateChannel: boolean;
    setUpdateChannel: React.Dispatch<React.SetStateAction<boolean>>;
}

/*
    NOTIFY NOTES
    setNotify(notify => ({message: "has joined the channel.", sender: response.user_id, timestamp: -1}));
*/

const   ChatWindow: React.FC<Props> = ({channel, updateChannel, setUpdateChannel}) => {
	
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    const inputRef = useRef<HTMLInputElement>(null);
    const [chat, setChat] = useState<IMessage[]>([]);

    // useEffect to update tmp chat when channel updates
    useEffect(() => {
        setChat(chat => []);
    }, [channel]);
    
    // event listeners
    useEffect(() => {
        socket.on("channel_message", response => {
            // only set the tmp chat when we are looking at that chat
            if (response.success && response.channel_id === channel.channelId) 
                setChat(chat => [...chat, response.message]);
            if (response.success)
                console.log(`socket.on channel_message success ${response.channel_id} current_id ${channel.channelId}`);
            else if (response.success === false)
                alert(response.msg);
        })

        socket.on("channel_leave", response  => {
            // if we are looking at the channel where a user leaves and we are NOT the user that left we want to update the channel
            if (response.success === true && response.channel_id === channel.channelId && response.user_id !== cookies.userID) 
                setUpdateChannel(updateChannel => !updateChannel);
            if (response.success === true)
                console.log(`socket.on channel_leave success current_id ${channel.channelId} affected_id ${response.channel_id}`);
            else if (response.success === false) 
                console.log(`socket.on channel_leave fail ${response.msg}`);
        });

        socket.on("channel_join", response => {
            // if we are looking at the channel where a new user joins we want to update the channel
            if (response.success === true && response.channel_id === channel.channelId)
                setUpdateChannel(updateChannel => !updateChannel);
            if (response.success === true)
                console.log(`socket.on channel_join success current_id ${channel.channelId} affected_id ${response.channel_id}`);
            else if (response.success === false)
                console.log(`socket.on channel_join fail ${response.msg}`);
        })

        socket.on("channel_promote", response => {
            // if we are looking at the channel where a user got promoted we want to update the channel
            if (response.success === true && channel.channelId === response.channel_id)
                setUpdateChannel(updateChannel => !updateChannel);
            if (response.success === true)
                console.log(`socket.on channel_promote success channel_id ${response.channel_id}`);
            else if (response.success === false) 
                console.log(`socket.on channel_promote fail ${response.msg}`);
        })

        socket.on("channel_demote", response => {
            // if we are looking at the channel where a user got demoted we want to update the channel
            if (response.success === true && channel.channelId === response.channel_id)
                setUpdateChannel(updateChannel => !updateChannel);
            if (response.success === true)
                console.log(`socket.on channel_demote success channel_id ${response.channel_id}`);
            else if (response.success === false) 
                console.log(`socket.on channel_demote fail ${response.msg}`);
        })

        socket.on("channel_ban", response => {
            // if we are looking at the channel where a user got banned and we are NOT the banned user we want to update the channel
            if (response.success === true && channel.channelId === response.channel_id && response.affected_id !== cookies.userID)
                setUpdateChannel(updateChannel => !updateChannel);
            if (response.success === true)
                console.log(`socket.on channel_ban success channel_id ${response.channel_id} banned_id ${response.affected_id}`);
            else if (response.success === false) 
                console.log(`socket.on channel_ban fail ${response.msg}`);
        })

        socket.on("channel_mute_user", response => {
            // if we are looking at the channel where a user got banned and we are the muted user, we want to update the channel
            if (response.success === true && channel.channelId === response.channel_id && response.affected_id === cookies.userID)
                setUpdateChannel(updateChannel => !updateChannel);
            if (response.success === true)
                console.log(`socket.on channel_mute_user success channel_id ${response.channel_id}`);
            else if (response.success === false) 
                console.log(`socket.on channel_mute_user fail ${response.msg}`);
        })

        return () => {
            socket.off("channel_message");
            socket.off("channel_leave");
            socket.off("channel_join");
            socket.off("channel_promote");
            socket.off("channel_demote");
            socket.off("channel_ban");
            socket.off("channel_mute_user");
        }
    }, [channel])

    // set input ref
    useEffect(() => {
        inputRef.current?.focus();
    }, [])

    // make chat scroll to bottom
    useEffect(() => {
        if(inputRef&& inputRef.current) {
          const element = inputRef.current;
          element.scroll({
            top: element.scrollHeight,
            left: 0,
            // behavior: "smooth"
          })
        }
    }, [inputRef, chat, channel])

    function returnName (id: number) : string {
        const ret = channel.users.find((e) => e.userId == id)?.name
        return (ret === undefined ? "Unknown User": ret);
    }

    function returnDate (timestamp : number) : string {
        const date = new Date(Number(timestamp));
        return(`${date.getHours() < 9 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 9 ? '0' + date.getMinutes() : date.getMinutes()}`);
    }

    const toggleSettings = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.preventDefault();
        console.log(channel.channelId);
        document.getElementById("chatSettings")?.classList.toggle("footerChat__show");
    };
    
    return (
        <>
        <div className="chatroom">
            {channel.channelName}
            <span className="chatroom__settingsicon" onClick={(e) => toggleSettings(e)}>
                <AiOutlineMenu />
            </span>
            <div className="chatroom__text" ref={inputRef}>
                {
                    channel.messages.map((element, index) => (
                        <div key={index} className="chatroom__text--bubble">
                            <p className="chatp"><b>{returnName(element.sender)} {returnDate(element.timestamp)}</b><br/>{element.message}</p>
                        </div>
                    ))
                }
                {
                    chat.map((element, index) => (
                        <div key={index} className="chatroom__text--bubble">
                            {
                                element.timestamp == -1 ?
                                <p className="chatp">{returnName(element.sender)} {element.message}</p> :
                                <p className="chatp"><b>{returnName(element.sender)} {returnDate(element.timestamp)}</b><br/>{element.message}</p>
                            }
                        </div>
                    ))
                }
            </div>
            <ChatInput channelId={channel.channelId}/>
        </div>
        </>
    )
};

export default ChatWindow;