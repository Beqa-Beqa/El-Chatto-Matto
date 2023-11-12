import { FcVideoCall } from "react-icons/fc";
import { MdCall } from "react-icons/md";
import { DocUser } from "../interfaces/UserInterfaces";

const ChatBoxNavbar = (props: {
  user: DocUser | null
}) => {
  if(props.user) {
    return (
      <div className="navbar w-100 h-10 bg-primary-5 d-flex justify-space-between align-center p-1">
        <div className="userinfo w-75 d-flex align-center">
          <img className="mr-1" src={props.user?.photoURL} alt="user image" />
          <p>{props.user && props.user.displayName}</p>
        </div>
        <div className="w-25 navbar-icons d-flex align-center justify-space-between">
          <MdCall className="icon" />
          <FcVideoCall className="icon" />
        </div>
      </div>
    );
  }
}
 
export default ChatBoxNavbar;