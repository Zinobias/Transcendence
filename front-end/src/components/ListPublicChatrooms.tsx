import React from "react";
import { IChannelInfo } from "../interfaces"
import { SlLock } from 'react-icons/sl'

interface Props {
    chatroom: IChannelInfo[];
}

const ListPublicChatrooms: React.FC<Props> = ({chatroom}) => {

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        console.log("click join");
    };

    return (
        <>
        {chatroom.map((e) => (
            // <p key={e.id}>{e.name}</p>
            <form key={e.channelId} className="listChat">
            <span className="listChat__text">{e.channelName}</span> 
            {
                e.hasPassword && 
                <span className="listChat__icon">
                    <SlLock />
                </span>
            }
            <button className="boringButton__small" onClick={(e) => handleClick(e)}>JOIN</button>
            </form>
        ))}
        </>
    );
};

export default ListPublicChatrooms;
