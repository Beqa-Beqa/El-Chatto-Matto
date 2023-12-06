import { useEffect, useContext, useState, useRef } from "react";
import { firestore } from "../../config/firebase";
import { DocumentData, collection, getDocs, query, where, writeBatch, getDoc, doc, arrayUnion, arrayRemove, deleteField } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { filterUsername } from "../../functions";
import { CiSearch } from "react-icons/ci";
import { GeneralContext } from "../../contexts/GeneralContextProvider";
import { UserChatsContext } from "../../contexts/UserChatsContextProvider";
import { IoMdPersonAdd, IoMdClose } from "react-icons/io";
import { IoPersonRemove } from "react-icons/io5";
import { useOutsideClick } from "../../hooks";

const UserSearch = (props: {
  className?: string,
  showInput?: boolean,
  setShowInput?: React.Dispatch<React.SetStateAction<boolean>>,
  showClose?: boolean,
  setShowClose?: React.Dispatch<React.SetStateAction<boolean>>,
  handleRequestAnswer?: (answer: string, requestFrom: string, type?: string) => Promise<void>
}) => {

  // Context for getting information about current user.
  const {currentUser} = useContext(AuthContext);
  const {width} = useContext(GeneralContext);
  // userChats information of currentuser served by user chats context provider.
  const {requestsSent, notifications, friends} = useContext(UserChatsContext);

  // Current user's userChats document reference.
  const currentUserDocRef = doc(firestore, "userChats", currentUser?.uid!);

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
  }, [userName]);

  // Send friend request.
  const handleSendFriendRequest = async (userData: DocumentData) => {
    const batch = writeBatch(firestore);
    try {
      // Get target user's data so override won't happen while sneding notification.
      const targUserData = await getDoc(doc(firestore, "userChats", userData.uid));
      const parsedData = targUserData.data();

      // Save current user's id as recieved request in target user's array.
      const targetUserdocRef = doc(firestore, "userChats", userData.uid);
      // Current date.
      const userIndex = currentUser?.uid;
      // We initialzie data for serving to target user because we need current time as a reference.
      const targetUserDataToServe: any = {
        notifications: {
          ...parsedData?.notifications
        }
      };
      // Set notification with current time with respective information.
      targetUserDataToServe.notifications[userIndex!] = {}
      targetUserDataToServe.notifications[userIndex!]["friendRequest"] = {
        timestamp: new Date().getTime(),
        isRead: false
      }

      // Update doc.
      batch.update(targetUserdocRef, targetUserDataToServe);

      // Save target user's id as sent request in current user's array.
      batch.update(currentUserDocRef, {
        requestsSent: arrayUnion(userData.uid)
      });

      await batch.commit();
    } catch (err) {
      console.log(err)
    }
  }
  
  // Cancel friend request.
  const handleCancelFriendRequest = async (userData: DocumentData) => {
    const batch = writeBatch(firestore);
    try {
      // Remove target user's id from sent requests array in current user docs.
      batch.update(currentUserDocRef, {
        requestsSent: arrayRemove(userData.uid)
      });
      // Remove current user's id from recieved requests array in target user docs.
      const targetUserdocRef = doc(firestore, "userChats", userData.uid);
      const targetUserDataToServe: any = {}
      targetUserDataToServe[`notifications.${currentUser?.uid}.friendRequest`] = deleteField();

      batch.update(targetUserdocRef, targetUserDataToServe);

      await batch.commit();
    } catch (err) {
      console.log(err);
    }
  }

  // Reference for this component's found users displayer div (for outside click purposes).
  const ref = useRef(null);
  useOutsideClick(ref, setShowUsers, false);

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
          return <div key={key} className="found-users d-flex justify-content-between align-items-center my-1 py-2 px-2">
            <div className="d-flex align-items-center">
              <img className="me-1 image" src={userData.photoURL} alt="user image" />
              <p className="fw-600 ms-1 me-md-5 me-3 mb-0">{userData.displayName}</p>
            </div>
            {!requestsSent?.includes(userData.uid) ?
              !friends.includes(userData.uid) ?
                !requestsRecievedFrom.includes(userData.uid) ?
                  <button onClick={async () => await handleSendFriendRequest(userData)} className="rounded friend-request d-flex align-items-center">
                    <IoMdPersonAdd className="friend-request-icon me-1" />
                    {width > 574 ? "Send Friend Request" : "Request"}
                  </button>
                :
                  <div className="d-flex align-items-center justify-content-start gap-1">
                    <button onClick={async () => props.handleRequestAnswer && await props.handleRequestAnswer("accept", userData.uid)} className="rounded friend-request d-flex align-items-center">
                      <IoMdPersonAdd className="friend-request-icon me-md-1 me-0" />
                      {width > 574 && "Accept"}
                    </button>
                    <button onClick={async () => props.handleRequestAnswer && await props.handleRequestAnswer("decline", userData.uid)} className="rounded friend-request d-flex align-items-center">
                      <IoMdClose className="friend-request-icon me-md-1 me-0" />
                      {width > 574 && "Decline"}
                    </button>
                  </div>
              :
                <button onClick={async () => props.handleRequestAnswer && await props.handleRequestAnswer("delete", userData.uid)} className="rounded friend-request d-flex align-items-center">
                  <IoPersonRemove className="friend-request-icon me-1" />
                  {width > 574 ? "Delete friend" : "Delete"}
                </button>
            :
              <button onClick={async () => await handleCancelFriendRequest(userData)} className="rounded friend-request d-flex align-items-center">
                <IoMdClose className="friend-request-icon me-1" />
                {width > 574 ? "Cancel Friend Request" : "Cancel"}
              </button>
            }
            </div>
        })}
      </div>
    </>
  );
}

export default UserSearch;