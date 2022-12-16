import React from 'react'
import { IChannelInfo } from "../interfaces"

interface Props {
    chatroom: IChannelInfo[];
}

const ListUserChatrooms : React.FC<Props> = ({chatroom}) => {

  return (
    <>
    {chatroom.map((e) => (
        <li key={e.channelId} className="listChat">
            <span className="listChat__text">{e.channelName}</span> 
        </li>
    ))}
    </>
  )
}

export default ListUserChatrooms