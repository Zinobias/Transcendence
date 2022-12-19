import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import { IChannelInfo } from "../interfaces"
import { SlLock } from 'react-icons/sl'
import {Md5} from "ts-md5";

interface Props {
    chatroom: IChannelInfo[];
}

const ListPublicChatrooms: React.FC<Props> = ({chatroom}) => {
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    const [pw, setPw] = useState<string>("");

    const handleJoin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, channelId: number, password: boolean) => {
        e.preventDefault();
        if (password) 
            document.getElementById(channelId.toString())?.classList.toggle("chatPwShow");
        else {
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "channel_join",
                data: {user_id: cookies.userID, channel_id: channelId}
            })
            console.log("emiting channel_join");
        }
    };

    const handlePwJoin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, channelId: number) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channel_join",
            data: {user_id: cookies.userID, channel_id: channelId, password: Md5.hashStr(pw + channelId)}
        })
        console.log("emiting channel_join with pw");
        setPw("");
        document.getElementById(channelId.toString())?.classList.toggle("chatPwShow");
    };

    return (
        <>
            <div className="chats">
            {chatroom.map((element, index) => (
                <div key={index}>
                    {
                        element.visible &&
                        <li className="listChat">
                            <span className="listChat__text">{element.channelName}</span> 
                            <button className="listChat__button" onClick={(e) => handleJoin(e, element.channelId, element.hasPassword)}>JOIN</button>
                            {
                                element.hasPassword && 
                                <span className="listChat__icon">
                                    <SlLock />
                                </span>
                            }
                            <div id={element.channelId.toString()} className="chatPw">
                                <form>
                                    <label className="pwform__label">password</label>
                                    <br/>
                                    <input type="password" value={pw} onChange={(e)=>setPw(e.target.value)} className="pwform__input"/>
                                    <button className="pwform__button" onClick={(e) => handlePwJoin(e, element.channelId)}>enter</button>
                                </form>
                            </div>

                        </li>
                    }
                </div>
            ))}
            </div>
        </>
    );
};

export default ListPublicChatrooms;
