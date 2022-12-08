import React, { useState, useRef, useEffect, useContext }  from "react";
import { useCookies } from "react-cookie";
import { IChannel, IMessage } from "../interfaces";
import ChatInput from "./ChatInput";
import { SocketContext } from "./Socket";
import { AiOutlineMenu } from "react-icons/ai";
import { TbCameraMinus } from "react-icons/tb";

interface Props {
    channel: IChannel | undefined;
}

const   ChatWindow: React.FC<Props> = ({channel}) => {
	
    const [chat, setChat] = useState<IMessage[]>([]);
    const [notify, setNotify] = useState<IMessage>();
    const [updateChannel, setUpdateChannel] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    var onMount : boolean = false;

    // WHEN THE CHANNEL CHANGES WE UPDATE THE TMP CHAT
    useEffect(() => {
        if (channel != undefined) {
            if (notify) {
                setChat([]);
                setChat(chat => [...chat, notify]);
                setNotify(notify => undefined);
            }
            else
                setChat(chat => []);
        }
    }, [channel]);
    
    // USE EFFECT TO UPDATE THE CHANNEL ON CERTAIN EVENTS
    useEffect(() => {
        if (channel) {
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "channel_retrieve_by_id", 
                data: { user_id: cookies.userID, channel_id: channel?.channelId }
            });
            console.log(`emitting channel_retrieve_by_id`);
        }
    }, [updateChannel]);

    // EVENT LISTENERS
    useEffect(() => {
        socket.on("channel_message", response => {
            if (response.success) {
                console.log(`socket.on channel_message success`);
                setChat(chat => [...chat, response.message]);
            }
            else 
                alert(response.msg);
        })

        socket.on("channel_leave", response  => {
            if (response.success == true && response.channel_id == channel?.channelId) {
                //setNotify(notify => ({message: "has joined the channel.", sender: response.user_id, timestamp: -1}));
                setUpdateChannel(updateChannel => !updateChannel);
            }
            else if (response.success == true)
                console.log(`socket.on channel_leave success channel_id ${response.channel_id}`);
            else if (response.success == false) {
                console.log("socket.on channel_leave fail");
                console.log(response.msg);
            }
        });

        socket.on("channel_join", response => {
            // if we are looking at the channel where a new user joins we want to update the channel
            if (response.success == true && response.channel_id == channel?.channelId) {
                //setNotify(notify => ({message: "has joined the channel.", sender: response.user_id, timestamp: -1}));
                setUpdateChannel(updateChannel => !updateChannel);
            }
            else if (response.success == true)
                console.log(`socket.on channel_join success channel_id ${response.channel_id}`);
            else if (response.success == false) {
                console.log("socket.on channel_join fail");
                console.log(response.msg);
            }
            // if (response.success == true && channel?.channelId === response.channel_id)
            //     setChat(chat => [...chat, {message: "has joined the channel.", sender: response.user_id, timestamp: -1}])
        })

        socket.on("channel_promote", response => {
            if (response.success == true && channel?.channelId === response.channel_id) {
                console.log("socket.on channel_promote success");
                //setNotify(notify => ({message: `got promoted by ${returnName(response.actor_id)}!`, sender: response.affected_id, timestamp: -1}));
                setUpdateChannel(updateChannel => !updateChannel);
            }
            else if (response.success == true)
                console.log(`socket.on channel_promote success channel_id ${response.channel_id}`);
            else if (response.success == false) {
                console.log("socket.on channel_promote fail");
                console.log(response.msg);
            }
        })

        socket.on("channel_demote", response => {
            if (response.success == true && channel?.channelId === response.channel_id) {
                console.log("socket.on channel_demote success");
                //setNotify(notify => ({message: `got demoted by ${returnName(response.actor_id)}!`, sender: response.affected_id, timestamp: -1}));
                setUpdateChannel(updateChannel => !updateChannel);
            }
            else if (response.success == true)
                console.log(`socket.on channel_demote success channel_id ${response.channel_id}`);
            else if (response.success == false) {
                console.log("socket.on channel_demote fail");
                console.log(response.msg);
            }
        })

        socket.on("channel_ban", response => {
            if (response.success == true && channel?.channelId === response.channel_id) {
                console.log("socket.on channel_ban success");
                setUpdateChannel(updateChannel => !updateChannel);
                //setChat(chat => [...chat, {message: `got banned for 30 minutes by ${response.actor_id}!`, sender: response.affected_id, timestamp: -1}])
            }
            else if (response.success == true)
                console.log(`socket.on channel_ban success channel_id ${response.channel_id}`);
            else if (response.success == false) {
                console.log("socket.on channel_ban fail");
                console.log(response.msg);
            }
        })

        socket.on("channel_mute_user", response => {
            if (response.success == true && channel?.channelId == response.channel_id) {
                console.log("socket.on channel_mute_user success");
                setUpdateChannel(updateChannel => !updateChannel);
                //setChat(chat => [...chat, {message: `got muted for 30 minutes by ${response.actor_id}!`, sender: response.affected_id, timestamp: -1}])
            }
            else if (response.success == true)
                console.log(`socket.on channel_mute_user success channel_id ${response.channel_id}`);
            else if (response.success == false) {
                console.log("socket.on channel_mute_user fail");
                console.log(response.msg);
            }
        })

        return () => {
            socket.off("channel_message");
            socket.off("channel_retrieve_by_id");
            socket.off("channel_leave");
            socket.off("channel_join");
            socket.off("channel_promote");
            socket.off("channel_demote");
            socket.off("channel_ban");
            socket.off("channel_mute_user");
        }
    }, [])

    // SET INPUT REF
    useEffect(() => {
        inputRef.current?.focus();
    }, [])

    // MAKE CHAT SCROOL TO BOTTOM
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
        const ret = channel?.users.find((e) => e.userId == id)?.name
        return (ret == undefined ? "Unknown User": ret);
    }

    function returnDate (timestamp : number) : string {
        const date = new Date(Number(timestamp));
        return(`${date.getHours() < 9 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 9 ? '0' + date.getMinutes() : date.getMinutes()}`);
    }

    const toggleSettings = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.preventDefault();
        document.getElementById("chatSettings")?.classList.toggle("footerChat__show");
    };

    if (channel == undefined) {
        return (
            <div className="chatroom">
                No Chatroom loaded
            </div>
        )
    }
    
    return (
        <>

        <div className="chatroom">
            {channel?.channelName}
            <span className="chatroom__settingsicon" onClick={(e) => toggleSettings(e)}>
                <AiOutlineMenu />
            </span>
            
            <div className="chatroom__text" ref={inputRef}>
                {
                    channel?.messages.map((element, index) => (
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