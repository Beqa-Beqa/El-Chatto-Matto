import { FcVideoCall } from "react-icons/fc";
import { MdCall, MdClose } from "react-icons/md";
import { DocumentData } from "firebase/firestore";

const ChatBoxNavbar = (props: {
  user: DocumentData | null,
  online: string[],
  setShowMessagingWindow: React.Dispatch<React.SetStateAction<boolean>>,
}) => {
  if(props.user) {
    return (
      <div className="chatbox-navbar d-flex align-items-center justify-content-between p-2">
        <div className="d-flex align-items-center">
          <img className="image me-2" src={props.user?.photoURL} alt="user image" />
          {props.user && props.online.includes(props.user.uid) ? <div className="onlineCircle" /> : null}
          <p className={props.user && props.online.includes(props.user.uid) ? "mb-0" : "mb-0 ms-2"}>{props.user && props.user.displayName}</p>
        </div>
        <div className="w-50 d-flex align-items-center justify-content-end gap-2">
          <div className="w-75 d-flex align-items-center justify-content-end">
            <MdCall className="chat-icon w-25" />
            <FcVideoCall className="chat-icon w-25" />
          </div>
          <MdClose onClick={() => props.setShowMessagingWindow(false)} className="chat-navbar-icon w-25" />
        </div>
      </div>
    );
  }
}
 
export default ChatBoxNavbar;