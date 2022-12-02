import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { IUser } from '../interfaces'
import { UserFriendSettings, UserSettings } from './ProfileUserUtils';

interface Props {
    user: IUser;
    queryId: number;
}

/*
    IMAGE UPLOAD NOTES

    const [selectedImage, setSelectedImage] = useState<any>(null);
    {
        selectedImage && (
            <>
            <img src={URL.createObjectURL(selectedImage)} alt="defaultAvatar" className="profileAvatar"/> 
            <button onClick={()=>setSelectedImage(null)}>Remove</button>
            </>
        )
    }
    <br/><br/>
    <input
        type="file"
        name="myImage"
        onChange={(event) => {
        console.log(event.target.files![0]);
        setSelectedImage(event.target.files![0]);
        }}
    />
*/

const ProfileUser : React.FC<Props> = ({user, queryId}) => {
    const defaultAvatar = "https://ynnovate.it/wp-content/uploads/2015/04/default-avatar.png";
    const [cookies] = useCookies(['userID', 'user']);

    console.log(user.avatar);

    function toBlob() : Blob {
        const newBlob = new Blob([user.avatar.data], {type: "image/png"});
        console.log(user.avatar);
        console.log(newBlob.type);
        return (newBlob);
    }

    return (
    <>
        <div className='profileLeft'>
            {
                user.avatar ?
                // <p>avatar</p> :
                <img src={URL.createObjectURL(toBlob())} alt="userAvatar" className="profileAvatar" /> :
                <img src={defaultAvatar} alt="defaultAvatar" className="profileAvatar"/> 
            }
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