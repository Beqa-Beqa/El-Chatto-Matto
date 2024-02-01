import { IoIosNotifications } from "react-icons/io";
import { useContext, useEffect, useRef, useState } from "react";
import { UserChatsContext } from "../../../contexts/UserChatsContextProvider";
import { writeBatch, doc, DocumentData, runTransaction } from "firebase/firestore";
import { firestore } from "../../../config/firebase";
import { AuthContext } from "../../../contexts/AuthContextProvider";
import { useOutsideClick } from "../../../hooks";
import { handleRequestAnswer } from "../../../functions/firebase";
import { useNavigate } from "react-router-dom";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";

const Notifications = () => {
  // check userchats context provider.
  const {notiCount, filteredNotifications, notifications} = useContext(UserChatsContext);
  // check auth context provider.
  const {currentUser} = useContext(AuthContext);
  // Trigger to trigger changes when redirecting to user profile.
  const {setTrigger} = useContext(RemoteUserContext);
  // State whether show notifications or not.
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Notification data.
  const [notificationUserData, setNotificationUserData] = useState<DocumentData[]>([]);
  // function to navigate through urls.
  const navigate = useNavigate();

  const handleUserClick = (url: string) => {
    navigate(url);
    setTrigger(prev => !prev);
  }

  // Styles for notification and notification icon.
  let notiStyle: string;
  let iconStyle: string;
  if(notiCount) {
    notiStyle = "notification-active";
    iconStyle = "navbar-icon-noti";
  } else {
    notiStyle = "d-none",
    iconStyle = "navbar-icon"
  }

  // handle notification reading.
  const handleNotificationRead = async () => {
    // Batch is used for multiple updates at once without need of reading docs in firestore
    // (check firestore docs for better understanding).
    const batch = writeBatch(firestore);
    // Current user document reference.
    const currentUserDocRef = doc(firestore, "userChats", currentUser?.uid!);

    // Loop through filterednotifications (filteredNotification keys are timestamps).
    for(let timestamp of Object.keys(filteredNotifications)) {
      // If key exists
      if(timestamp){
        // Get data of notification from that timestamp.
        const timestampNotification = filteredNotifications[timestamp];

        // If the notification is not read yet
        if(!timestampNotification["isRead"]) {
          // Get properties.
          const from = timestampNotification["from"];
          const type = timestampNotification["type"];

          // Update chunk is what is sent to update document to set isRead true for the notifications
          // Whose isRead is set to false.
          const updateChunk: any = {notifications};
          // Update property.
          updateChunk.notifications[from][type]["isRead"] = true;

          // Update command for batch.
          batch.update(currentUserDocRef, updateChunk);

        } else {
          // If notification is read, break the cycle.
          // In filterenotifications all the notifications are sorted accordingly, 
          // newest notification is first, latest is last, therefore while mapping through
          // notifications, if the notification is already read it means all the other notifications
          // are also read below it.
          break;
        }
      }
    }

    // When making multiple read operations, finnaly call commit to commit all the updates.
    batch.commit();
    // update state whether to show or not notifications.
    setShowNotifications(prev => !prev);
  }

  // Get data of users from notifications.
  const getNotificationData = async () => {
    // Run function if filteredNotifications is not empty.
    if(Object.keys(filteredNotifications)) {
      // Transactions are used here for making multiple reads at once, (check firestore docs for better understanding).
      const transactionResult = await runTransaction(firestore, async (transaction) => {
        // Temporary array for storing information.
        const temporrArr: DocumentData[] = [];

        // Map through all userIds in notifications.
        for(let userId of Object.keys(notifications)) {
          // Update document reference based on current userId in for loop.
          const userDocRef = doc(firestore, "users", userId);
          // Get data of user.
          const userData = await transaction.get(userDocRef);

          // If doc exists and not in temporarry array, then push it to temporary array.
          if(userData.exists() && !temporrArr.includes(userData.data())){
            temporrArr.push(userData.data());
          }
        }

        // Return temporary array as a transaction result.
        return temporrArr;
      });

      // Update state.
      setNotificationUserData(transactionResult);
    }
  }

  // Call getNotificationData anytime notifications change.
  useEffect(() => {
    getNotificationData();
  }, [filteredNotifications]);

  // Notification actions render.
  const renderActions = (from: string, type: string, isRead: boolean) => {
    // If notification type is friendRequest.
    if(type === "friendRequest") {
      return <div>
        {!isRead ? <strong>Sent you a friend request</strong> : <p className="m-0">Sent you a friend request</p>}
        <div className="actions d-flex align-items-center justify-content-between mt-2">
          <button onClick={() => handleRequestAnswer(firestore, currentUser!, "accept", from)} className="action-button rounded" type="submit">Accept</button>
          <button onClick={() => handleRequestAnswer(firestore, currentUser!, "decline", from)} className="action-button rounded" type="submit">Decline</button>
        </div>
      </div>
    }
  }

  // Reference for this component's notification displayer div (for outside click purposes).
  const ref = useRef(null);
  useOutsideClick(ref, setShowNotifications, false);

  return (
    <>
      <div onClick={handleNotificationRead} className="notifications d-flex align-items-center me-2 rounded">
        <span className={`${notiStyle} d-flex align-items-center justify-content-center rounded`}>{notiCount}</span>
        <IoIosNotifications className={`${iconStyle} me-0`} />
      </div>
      <div ref={ref} style={{width: 220}} className="position-fixed notifications-container mx-2 mx-md-5 rounded">
        {
          showNotifications && Object.keys(filteredNotifications).length ?
            Object.keys(filteredNotifications).map((timestamp, key: number) => {
              const from = filteredNotifications[timestamp]["from"];
              const type = filteredNotifications[timestamp]["type"];
              const isRead = filteredNotifications[timestamp]["isRead"];
              const userData: DocumentData = notificationUserData.filter((user) => user.uid === from)[0];

              return <div key={key} className="d-flex flex-column notification-item">
                <div className="d-flex align-items-center p-2">
                  <img onClick={() => handleUserClick(from)} className="rounded-circle image me-3 cursor-pointer" src={userData && userData.photoURL} alt="user" />
                  {!isRead ? <strong>{userData && userData.displayName}</strong> : <p className="m-0">{userData && userData.displayName}</p>}
                </div>
                <div className="p-2">
                  {renderActions(from, type, isRead)}
                </div>
              </div>
            })
          : showNotifications ?
              <div className="text-center px-2 py-4">
                <p className="m-0">No new notifications</p>
              </div>
          :
            null
        }
      </div>
    </>
  );
}

export default Notifications;