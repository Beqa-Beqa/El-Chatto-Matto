import { FcVideoCall } from "react-icons/fc";
import { MdCall } from "react-icons/md";
import { DocumentData } from "firebase/firestore";

const ChatBoxNavbar = (props: {
  user: DocumentData | null,
  online: string[]
}) => {
  if(props.user) {
    return (
      <div className="navbar w-100 h-10 bg-primary-5 d-flex justify-space-between align-center p-1">
        <div className="userinfo w-75 d-flex align-center">
          <img src={props.user?.photoURL} alt="user image" />
          {props.user && props.online.includes(props.user.uid) ? <div className="onlineCircle" /> : null}
          <p className={props.user && props.online.includes(props.user.uid) ? "" : "ml-1"}>{props.user && props.user.displayName}</p>
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