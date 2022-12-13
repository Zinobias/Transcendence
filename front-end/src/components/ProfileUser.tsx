import { useContext, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { IUser } from '../interfaces'
import { UserFriendSettings, UserSettings } from './ProfileUserUtils';
import { SocketContext } from './Socket';

interface Props {
    user: IUser;
    queryId: number;
}

const ProfileUser : React.FC<Props> = ({user, queryId}) => {
    const defaultAvatar = "https://ynnovate.it/wp-content/uploads/2015/04/default-avatar.png";
    const [cookies] = useCookies(['userID', 'user']);
    const socket = useContext(SocketContext);
    
    // console.log(user.avatar);

    // event listener for testing
    useEffect(() => {
        socket.on("block_user", response => {
            if (response.success)
                console.log("socket.on block_user success");
            else 
                console.log(response.msg);
        })
        socket.on('unblock_user', response => {
            if (response.success) 
                console.log("socket.on unblock_user success");
            else 
                console.log(response.msg);

        })
        return () => {
            socket.off('block_user');
            socket.off('unblock_user');
        }
    }, [])

    function toBlob() : Blob {
        var imageArray = new Uint8Array(user.avatar.data);
        const newBlob = new Blob([imageArray]);
        return (newBlob);
    }
    
    return (
    <>
        <div className='profileLeft'>
            <div className='profileAvatar'>
            {
                user.avatar ?
                <img src={URL.createObjectURL(toBlob())} alt="userAvatar" className="profileAvatar_image" /> :
                <img src={defaultAvatar} alt="defaultAvatar" className="profileAvatar_image"/> 
            }
            </div>
            {user.name}
            <br/><br/>
            {
                queryId == cookies.userID ? 
                <UserSettings user={user}/> :
                <UserFriendSettings user={user}/>
            }
        </div>
        <div className='profileRight'>
            <p>stats: </p>
            <p>match history: </p>
        </div>
    </>
    )
}

export default ProfileUser