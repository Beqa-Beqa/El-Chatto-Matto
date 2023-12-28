import { useState, useContext } from "react";
import { DocumentData } from "firebase/firestore";
import { MessagingWindow } from "../..";
import { FaUsersRectangle, FaRegRectangleXmark } from "react-icons/fa6"
import { GeneralContext } from "../../../contexts/GeneralContextProvider";
import { UserChatsContext } from "../../../contexts/UserChatsContextProvider";

const Contacts = (props: {
  className?: string
}) => {
  // width for retrieving window innerwidth.
  const {width} = useContext(GeneralContext);
  // friends list of current user.
  const {online, friendsData} = useContext(UserChatsContext);

  // showUsers state for showing contacts or not.
  const [showContacts, setShowContacts] = useState<boolean>(false);
  // State for showing messaging window or not.
  const [showMessagingWindow, setShowMessagingWindow] = useState<boolean>(false);
  // User state of which we chose to chat with.
  const [user, setUser] = useState<DocumentData | null>(null);

  const messagingWindowStyles = width > 574 ? {width: 370, height: 520} : {width: "100%", height: "90vh"};

  return (
    <>
      <div className={`loggedin-friends ${props.className}`}>
      {
        width >= 1024 || showContacts ?
          <>
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="fs-4 m-0">Contacts</h3>
              {width < 1024 && <FaRegRectangleXmark className="icon" onClick={() => setShowContacts(false)} />}
            </div>
            <div style={{width: 300}} className="friends-container mt-2">
              {/* Map all user data and render them */}
              {friendsData.map((userInfo: DocumentData | undefined, key: number) => {
                return <div onClick={() => {
                  setUser(userInfo!)
                  setShowMessagingWindow(true)
                }} key={key} className="d-flex align-items-center py-1 px-2 friend-info-container">
                  <img className="image" src={userInfo!.photoURL} alt="user image" />
                  {online.includes(userInfo?.uid) && <div className="onlineCircle" />}
                  <p className={online.includes(userInfo?.uid) ? "fw-600 mb-0" : "fw-600 mb-0 ms-2"}>{userInfo!.displayName}</p>
                </div>
              })}
            </div>
          </>
        : <FaUsersRectangle className="icon" onClick={() => setShowContacts(true)} />
      }
      </div>
      {showMessagingWindow ? <MessagingWindow styles={messagingWindowStyles} setShowMessagingWindow={setShowMessagingWindow} user={user} classname="position-fixed bottom-0 end-0 me-md-5 bg-primary" /> : null}
    </>
  );
}

export default Contacts;