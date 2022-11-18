import React from "react";
import { TestRoom } from "../interfaces"
import { SlLock } from 'react-icons/sl'

interface Props {
    chatroom: TestRoom[];
}

const ListChatrooms: React.FC<Props> = ({chatroom}) => {

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
    };

    return (
        <>
        {chatroom.map((e) => (
            // <p key={e.id}>{e.name}</p>
            <form key={e.id} className="listChat">
            <span className="listChat__text">{e.name}</span> 
            {
                e.password && 
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

export default ListChatrooms;
