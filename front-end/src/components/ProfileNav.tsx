import React, { useState, useRef, useEffect }  from "react";
// import LogoutButton from './Buttons';
import '../App.css'
import { AiFillSlackSquare } from "react-icons/ai";

/*
    An <Outlet> should be used in parent route elements to render their child route elements. 
    This allows nested UI to show up when child routes are rendered. If the parent route matched exactly
*/

const ProfileNav: React.FC = () => {

    const [open, setOpen] = useState<boolean>(false);
    const wrapperRef = useRef<HTMLElement>(null);
    
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: any) {
            // if (event.type  === "mousedown")
            //     console.log("outside click");
            if (wrapperRef.current) 
                console.log("outside click");
            // if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            //     console.log("outside click");
            // }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          // Unbind the event listener on clean up
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [wrapperRef]);

    const handleClick = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.preventDefault();
        console.log("inside click");
        setOpen(true);
        // document.getElementById("myDropdown")?.classList.toggle("show");
    };

    return (
        <div id="myProfile" className="profile">
            <img
                src="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png"
                alt="defaultAvatar"
                className="profile__avatar"
                onClick={(e) => handleClick(e)}
            />
            <div id="myDropdown" className="profile__dropdown">
                <p>Theme</p>
                <p>Change Avatar</p>
                <p>Friends: </p>
            </div>
        </div>
      );
}

export default ProfileNav;