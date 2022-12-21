import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import { IChannel, IChannelInfo } from "../interfaces";

interface Props {
    channelId: number | undefined;
    setChannelId: React.Dispatch<React.SetStateAction<number | undefined>>;
    channel: IChannel | undefined;
    setChannel: React.Dispatch<React.SetStateAction<IChannel | undefined>>;
}

interface INames {
    userId  : number;
    name    : string;
}

const ChatSidebar: React.FC<Props> = ({channelId, setChannelId, channel, setChannel}) => {

    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    const [state, setState] = useState<boolean>(false);
    const [channels, setChannels] = useState<IChannelInfo[]>([]);
    const [names, setNames] = useState<INames[]>([]);

    // when the state changes we want to update the channels in the sidebar
    useEffect(() => {
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "get_channels_user",
            data: {user_id: cookies.userID}
        })
        // console.log("emiting get_channels_user");
    }, [state])


    // EVENT LISTENERS
    useEffect(() => {
        socket.on("get_channels_user", response  => {
            // console.log(`socket.on get_channels_user success`);
            setChannels([]);
            response.channels.forEach((element : IChannelInfo) => {
                setChannels(channels => [...channels, element]);
                if (element.otherOwnderId != -1 && !names.find((e) => e.userId == element.otherOwnderId)) {
                    socket.emit("chat", {
                        userId: cookies.userID,
                        authToken: cookies.user,
                        eventPattern: "get_name", 
                        data: { user_id: cookies.userID, requested_user_id: element.otherOwnderId }
                    });
                }
                // console.log(`${element.channelName} ${element.channelId}`);
            });
        });

        socket.on("channel_join", channelJoinInSidebar)
        socket.on("channel_leave", channelLeaveInSidebar);
        socket.on("channel_ban", channelBanInSidebar);

        return () => {
            socket.off("get_channels_user");
            socket.off("channel_join", channelJoinInSidebar);
            socket.off("channel_leave", channelLeaveInSidebar);
            socket.off("channel_ban", channelBanInSidebar);
        }
    }, [channelId, names])

    useEffect(() => {
        socket.on("get_name", getNameInSidebar);

        return () => {
            socket.off("get_name", getNameInSidebar);
        }
    }, [])

    function channelJoinInSidebar (response : any) {
        // if current user joined a channel update side channels
        if (response.success && response.user_id == cookies.userID) {
            // console.log("socket.on channel join success");
            if (document.getElementById("footerDropdown")?.classList.contains("footerChat__show") == false)
                document.getElementById("footerDropdown")?.classList.toggle("footerChat__show");
            setState(state => !state);
        }
        else if (response.success === false)
            alert(response.msg);
    }

    function channelLeaveInSidebar (response : any) {
        // if current user left the channel update sidechannels
        if (response.success && cookies.userID == response.user_id)
            setState(state => !state);
        // if current user left and was looking at the channel set channel to undefined
        if (response.success && channelId == response.channel_id && cookies.userID == response.user_id)
        {
            setChannelId(channelId => undefined);
            setChannel(channel => undefined);   
        }
    }

    function channelBanInSidebar (response : any) {
        // if current user got banned update sidechannels
        if (response.success && cookies.userID == response.affected_id)
            setState(state => !state);
        // if current user got banned and was looking at the channel set channel to undefined
        if (response.success && channelId == response.channel_id && cookies.userID == response.affected_id)
            setChannel(channel => undefined);
    }

    function getNameInSidebar (response : any) {
        if (response.success) {
            // console.log("get_name success " + response.requested_name);
            setNames(names => [...names, {userId: response.requested_id, name: response.requested_name}]);
        }
    }

    // helper functions
    function returnName (id : number) : string {
        const ret = names.find((e) => e.userId == id)?.name;
        return (ret === undefined ? "Unknown User": ret);
    }

    /*
    TODO:
    only show channels that are visible
    */

    const setIdTemp = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, id : number) => {
        e.preventDefault();
        setChannelId(channelId => id);
    }

    return (
    <div>
        <p style={{textAlign: "center", lineHeight: "0"}}>MY CHATS:</p>
        {channels.map((element) => (
        <li key={element.channelId} className="listChat">
            <span className="listChatUser__text" onClick={(e) => setIdTemp(e, element.channelId)}>{element.otherOwnderId == -1 ? element.channelName : returnName(element.otherOwnderId)}</span> 
        </li>
        ))}
    </div>
    )

}

export default ChatSidebar