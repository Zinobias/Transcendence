import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { IUser } from '../interfaces'
import { UserFriendSettings, UserSettings } from './ProfileUserUtils';

interface Props {
    user: IUser;
    queryId: number;
}

const ProfileUser : React.FC<Props> = ({user, queryId}) => {
    const defaultAvatar = "https://ynnovate.it/wp-content/uploads/2015/04/default-avatar.png";
    const [cookies] = useCookies(['userID', 'user']);

    console.log(user.avatar);

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