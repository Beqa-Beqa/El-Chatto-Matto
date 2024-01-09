import { FcVideoCall } from "react-icons/fc";
import { MdCall, MdClose } from "react-icons/md";
import { DocumentData } from "firebase/firestore";
import { useContext } from "react";
import { UserChatsContext } from "../../../contexts/UserChatsContextProvider";
import { useNavigate } from "react-router-dom";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";

const ChatBoxNavbar = (props: {
  user: DocumentData | null,
  setShowMessagingWindow: React.Dispatch<React.SetStateAction<boolean>>,
  isInChat: boolean
}) => {
  // Online and away status users id arrays.
  const {online, away} = useContext(UserChatsContext);
  // setTrigger forces refetch of userdata.
  const {setTrigger} = useContext(RemoteUserContext);
  // to navigate through different urls.
  const navigate = useNavigate();

  if(props.user) {
    return (
      <div className="chatbox-navbar d-flex align-items-center justify-content-between p-2">
        <div className="d-flex align-items-center">
          <img style={{cursor: "pointer"}} onClick={() => {setTrigger(prev => !prev); navigate(`/${props.user!.uid}`);}} className="image me-2" src={props.user?.photoURL} alt="user image" />
          {online.includes(props.user.uid) && <div className="onlineCircle" />}
          {away.includes(props.user.uid) && <div className="awayCircle" />}
          <p className={props.user && (online.includes(props.user.uid) || away.includes(props.user.uid)) ? "mb-0" : "mb-0 ms-2"}>{props.user && props.user.displayName}</p>
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