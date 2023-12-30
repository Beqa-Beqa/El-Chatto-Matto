import { useEffect, useContext, useState, useRef } from "react";
import { firestore } from "../../../config/firebase";
import { DocumentData, collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../../../contexts/AuthContextProvider";
import { filterUsername } from "../../../functions/general";
import { CiSearch } from "react-icons/ci";
import { GeneralContext } from "../../../contexts/GeneralContextProvider";
import { UserChatsContext } from "../../../contexts/UserChatsContextProvider";
import { IoMdPersonAdd, IoMdClose } from "react-icons/io";
import { IoPersonRemove } from "react-icons/io5";
import { useOutsideClick } from "../../../hooks";
import { handleCancelFriendRequest, handleSendFriendRequest, handleRequestAnswer } from "../../../functions/firebase";
import { useNavigate } from "react-router-dom";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";
import { deletePrompt } from "../../../App";

const UserSearch = (props: {
  className?: string,
  showInput?: boolean,
  setShowInput?: React.Dispatch<React.SetStateAction<boolean>>,
  showClose?: boolean,
  setShowClose?: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  // Context for getting information about current user.
  const {currentUser} = useContext(AuthContext);
  const {width} = useContext(GeneralContext);
  const {setTrigger} = useContext(RemoteUserContext);
  // userChats information of currentuser served by user chats context provider.
  const {requestsSent, notifications, friends} = useContext(UserChatsContext);

  const navigate = useNavigate();

  // Username for search.
  const [userName, setUserName] = useState<string>("");

  // state for whether showing users or not.
  const [showUsers, setShowUsers] = useState<boolean>(false);

  // User data that contains searched users.
  const [userData, setUserData] = useState<DocumentData[]>([]);

  const requestsRecievedFrom = Object.keys(notifications).filter((user) => {
    return Object.keys(notifications[user]).includes("friendRequest");
  });

  const getUserData = async () => {
    if(userName) {
      // Collection refference and creating AND query.
      const colRef = collection(firestore, "users");
      const qry = query(
        colRef,
        where("searchArray", "array-contains", filterUsername(userName)),
        where("uid", "!=", currentUser?.uid)
      );
    
      try {
        // Temporary array to store information.
        const temporarArr: any = [];
        // snapshot encapsulates all the data retrieved from query (qry) request.
        const snapshot = await getDocs(qry);
        // Loop through encapsulated data and store them in temporary array.
        // Retrieve data with doc.data().
        snapshot.forEach((doc) => {
          temporarArr.push(doc.data());
        });
        // Update state so that data will be avaliable through this component globally.
        setUserData(temporarArr);
      } catch (err) {
        // Any errors? log them. :]
        console.error(err);
      }
    } else {
      setUserData([]);
    }
  }

  // Useffect calls getUserData anytime when username for search field changes.
  useEffect(() => {
    // when username changes run getuserdata function.
    getUserData();
    // if username is not an empty string set showusers to true otherwise false.
    userName ? setShowUsers(true) : setShowUsers(false);
    !userName && props.setShowClose ? props.setShowClose(false) : null;
  }, [userName]);

  // Reference for this component's found users displayer div (for outside click purposes).
  const ref = useRef(null);
  useOutsideClick(ref, setShowUsers, false);

  const [actionPromptVisible, setActionPromptVisible] = useState<boolean>(false);
  const promptRef = useRef<HTMLDivElement | null>(null);


  useOutsideClick(promptRef, setActionPromptVisible, false);

  // Update prUser state for deletePrompt.
  const [prUser, setPrUser] = useState<DocumentData | null>(null);

  return (
    <>
      <div className={`${props.className} d-flex align-items-center`}>
        {width > 574 || props.showInput ? <input placeholder="Find users" className="border-0 px-1" type="text" onChange={(e) => {
          setUserName(e.target.value)
          props.setShowClose && props.setShowClose(true);
        }} value={userName} />
        :
        <CiSearch className="navbar-icon" onClick={() => {
          props.setShowInput && props.setShowInput(true)
          props.setShowClose && props.setShowClose(true)
        }} 
        />}
        {props.showClose && <IoMdClose onClick={() => {
          setUserName("")
          props.setShowInput && props.setShowInput(false)
          props.setShowClose && props.setShowClose(false)
        }} className="ms-1 navbar-icon" />}
      </div>
      <div ref={ref} className="position-fixed d-flex flex-column found-users-container rounded">
        {showUsers && userData.map((userData: DocumentData, key: number) => {
          return <div onClick={(e) => {
              const target = e.target as HTMLElement;
              if(target.className.includes("redirect")) {
                setTrigger(prev => !prev);
                navigate(`/${userData.uid}`);
              }
            }}
            key={key} className="redirect found-users d-flex justify-content-between align-items-center py-2 px-2">
            <div className="redirect d-flex align-items-center">
              <img className="redirect me-1 image" src={userData.photoURL} alt="user image" />
              <p className="redirect fw-600 ms-1 me-md-5 me-3 mb-0">{userData.displayName}</p>
            </div>
            {!requestsSent?.includes(userData.uid) ?
              !friends.includes(userData.uid) ?
                !requestsRecievedFrom.includes(userData.uid) ?
                  <button onClick={async () => await handleSendFriendRequest(firestore, currentUser!, userData)} className="rounded action-button d-flex align-items-center">
                    <IoMdPersonAdd className="action-button-icon me-1" />
                    {width > 574 ? "Send Friend Request" : "Request"}
                  </button>
                :
                  <div className="d-flex align-items-center justify-content-start gap-1">
                    <button onClick={async () => await handleRequestAnswer(firestore, currentUser!, "accept", userData.uid)} className="rounded action-button d-flex align-items-center">
                      <IoMdPersonAdd className="action-button-icon me-md-1 me-0" />
                      {width > 574 && "Accept"}
                    </button>
                    <button onClick={async () => await handleRequestAnswer(firestore, currentUser!, "decline", userData.uid)} className="rounded action-button d-flex align-items-center">
                      <IoMdClose className="action-button-icon me-md-1 me-0" />
                      {width > 574 && "Decline"}
                    </button>
                  </div>
              :
                <button onClick={() => {setPrUser(userData); setActionPromptVisible(true);}} className="rounded action-button d-flex align-items-center">
                  <IoPersonRemove className="action-button-icon me-1" />
                  {width > 574 ? "Delete friend" : "Delete"}
                </button>
            :
              <button onClick={async () => await handleCancelFriendRequest(firestore, currentUser!, userData)} className="rounded action-button d-flex align-items-center">
                <IoMdClose className="action-button-icon me-1" />
                {width > 574 ? "Cancel Friend Request" : "Cancel"}
              </button>
            }
            </div>
        })}
        {actionPromptVisible &&
          prUser &&
            <div className="user-prompt">
              <div ref={promptRef}>
                {deletePrompt(prUser.displayName, async () => {
                  await handleRequestAnswer(firestore, currentUser!, "delete", prUser.uid);
                  setActionPromptVisible(false);
                }, () => setActionPromptVisible(false))}
              </div>
            </div>
        }
      </div>
    </>
  );
}

export default UserSearch;