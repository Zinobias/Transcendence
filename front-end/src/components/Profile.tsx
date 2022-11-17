import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';

/*
    check what profile it should display with the searchParams
    send the userId/Name with the navigate through params
    only valid userid/name should be allowed
    query strings
*/

const Profile = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [state, setState] = useState<boolean>(false);

    useEffect(() => {
        if (searchParams.get("id")) {
            console.log(searchParams.get("id"));
            //check if valid ID and if so set to true otherwise nothing
            setState(true);
        }
    }, [])

    return (
        <div>
            {
                state ?
                <p>Profile</p> :
                <p>Page doest exist</p>
            }
        </div>
    )
}

export default Profile