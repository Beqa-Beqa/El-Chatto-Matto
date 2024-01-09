import { useState, useContext } from "react";
import { DocumentData } from "firebase/firestore";
import { MessagingWindow } from "../..";
import { FaUsersRectangle, FaRegRectangleXmark } from "react-icons/fa6"
import { GeneralContext } from "../../../contexts/GeneralContextProvider";
import { UserChatsContext } from "../../../contexts/UserChatsContextProvider";
import { MessagesContext } from "../../../contexts/MessagesContextProvider";
import { AuthContext } from "../../../contexts/AuthContextProvider";
import { BsChatTextFill } from "react-icons/bs";

const Contacts = (props: {
  className?: string
}) => {
  // info of currentuser.
  const {currentUser} = useContext(AuthContext);
  // width for retrieving window innerwidth.
  const {width} = useContext(GeneralContext);
  // friends list of current user.
  const {online, away, friendsData} = useContext(UserChatsContext);
  // readByData (messages that are not read)
  const {readByData, allMessagesData} = useContext(MessagesContext);
  // state for showing contacts or not.
  const [showContacts, setShowContacts] = useState<boolean>(false);
  // State for showing messaging window or not.
  const [showMessagingWindow, setShowMessagingWindow] = useState<boolean>(false);
  // User state of which we chose to chat with.
  const [user, setUser] = useState<DocumentData | null>(null);

  const messagingWindowStyles = width > 768 ? {width: 370, height: 520} : {width: "100%", height: "90vh"};
  // count for all unread messages.
  const allUnreadMessagesCount = Object.values(readByData).reduce((totalUnreadCount, data) => { 
    if(data.readBy && !data.readBy[currentUser!.uid]) {
      totalUnreadCount += data.unreadMessagesCount;
    }

    return totalUnreadCount
  }, 0);

  return (
    <>
      <div className={`loggedin-friends h-100 ${props.className}`}>
      {
        width >= 1024 || showContacts ?
          <div style={{maxHeight: "calc(100vh - 72px)"}} className="h-100 d-flex flex-column">
            <div style={{height: 85}} className="d-flex align-items-start justify-content-between">
              <div className={`d-flex flex-column ${width >= 1024 ? "ps-0" : "ps-4"}`}>
                <h3 className="fs-4 m-0">Contacts</h3>
                <span className="d-flex align-items-center"><div className="onlineCircle position-static me-1" />- Online &#40; {online.length} &#41;</span>
                <span className="d-flex align-items-center"><div className="awayCircle position-static me-1" />- Away &#40; {away.length} &#41;</span>
              </div>
              {width < 1024 && <FaRegRectangleXmark className="icon" onClick={() => setShowContacts(false)} />}
            </div>
            <div style={width >= 1024 ? {width: 350} : {width: "100vw"}} className="h-100 friends-container mt-2">
              {/* Map all user data and render them */}
              {friendsData.map((userInfo: DocumentData | undefined, key: number) => {
                // thisReadBy is an isReadBy object with an user on which array.prototype.map is currently.
                const thisReadBy = readByData[`chatWith-${userInfo?.uid}`];
                const isReadByCurrentUser: boolean = thisReadBy.readBy && thisReadBy.readBy[currentUser!.uid] || false;
                const unreadMessagesCount: number = !isReadByCurrentUser && thisReadBy.unreadMessagesCount || 0;
                const showAsUnread: boolean = !isReadByCurrentUser && unreadMessagesCount > 0;
                const messageData = allMessagesData![userInfo!.uid];
                const lastMessageKey = Math.max(...Object.keys(messageData).filter((key: string) => parseInt(key) && key).map((key: string) => parseInt(key)), 0);

                // styles for unread messages.
                const unreadMessageDivStyles = {fontWeight: "bold"};
                const unreadMessageImgStyles = {border: "2px solid #00ffd0"};

                return <div onClick={() => {
                  setUser(userInfo!)
                  setShowMessagingWindow(true)
                }} key={key} className={`w-100 rounded d-flex align-items-center py-1 ${width >= 1024 ? "px-2" : "px-4"} friend-info-container`}>
                  <img style={showAsUnread ? unreadMessageImgStyles : {}} className="image" src={userInfo!.photoURL} alt="user image" />
                  {online.includes(userInfo?.uid) && <div className="onlineCircle" />}
                  {away.includes(userInfo?.uid) && <div className="awayCircle" />}
                  <div style={showAsUnread ? unreadMessageDivStyles : {}} className={online.includes(userInfo?.uid) || away.includes(userInfo?.uid) ? "fw-600 w-100" : "fw-600 ms-2 w-100"}>
                    <div className="w-100 d-flex justify-content-start align-items-center gap-3">
                      <span>{userInfo!.displayName}</span>
                      {showAsUnread && <span className="d-flex align-items-center justify-content-center gap-2"> {unreadMessagesCount <= 9 ? unreadMessagesCount : "9+"} New <BsChatTextFill /></span>}
                    </div>
                    {lastMessageKey !== 0 && 
                      <span className="last-message">
                        {
                          `${messageData[lastMessageKey].senderId === currentUser?.uid ? "You: " : ""} 
                          ${messageData[lastMessageKey].message ? messageData[lastMessageKey].message 
                          : messageData[lastMessageKey].img ? "Sent an image" : ""}`
                        }
                      </span>
                    }
                  </div>
                </div>
              })}
            </div>
          </div>
        : 
          <>
            <FaUsersRectangle className="icon" onClick={() => setShowContacts(true)} />
            {allUnreadMessagesCount > 0 &&
              <span 
                className="px-2 position-relative text-secondary rounded d-flex justify-content-center align-items-center" 
                style={{backgroundColor: "#FF4081", width: 30, height: 20, top: -40, left: -20}} >
                  {allUnreadMessagesCount > 9 ? "9+" : allUnreadMessagesCount}
              </span>
            }
          </>
      }
      </div>
      {showMessagingWindow && <MessagingWindow styles={messagingWindowStyles} setShowMessagingWindow={setShowMessagingWindow} user={user} classname="position-fixed bottom-0 end-0 me-md-5 bg-primary" />}
    </>
  );
}

export default Contacts;