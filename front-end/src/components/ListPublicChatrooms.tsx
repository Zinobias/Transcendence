import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import { IChannelInfo } from "../interfaces"
import { SlLock } from 'react-icons/sl'

interface Props {
    chatroom: IChannelInfo[];
}

const ListPublicChatrooms: React.FC<Props> = ({chatroom}) => {
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);

    // EVENT LISTENERS
    useEffect(() => {
        socket.on("channel_join", response => {
            if (response.success == true)
                console.log(`socket.on channel_join success`);
            else {
                alert(response.msg);
                console.log(`socket.on channel_join fail`);
            }
        })

        return () => {
            socket.off("channel_join");
        }
    },[])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, channelId: number) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channel_join",
            data: {user_id: cookies.userID, channel_id: channelId}
        })
        console.log("emiting channel_join");
    };

    return (
        <>
        {chatroom.map((element) => (
            <form key={element.channelId} className="listChat">
            <span className="listChat__text">{element.channelName}</span> 
            {
                element.hasPassword && 
                <span className="listChat__icon">
                    <SlLock />
                </span>
            }
            <button className="boringButton__small" onClick={(e) => handleClick(e, element.channelId)}>JOIN</button>
            </form>
        ))}
        </>
    );
};

export default ListPublicChatrooms;
