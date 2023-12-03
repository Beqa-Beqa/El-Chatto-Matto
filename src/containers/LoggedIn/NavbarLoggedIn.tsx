import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { signOut } from "firebase/auth";
import { auth, firestore } from "../../config/firebase";
import { updateDoc, doc, DocumentData, arrayUnion, getDoc, setDoc, arrayRemove, deleteField, writeBatch } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { LogoWhite } from "../../assets/images";
import { NavDropdown } from "react-bootstrap";
import { IoIosNotifications, IoMdPersonAdd, IoMdClose } from "react-icons/io";
import { UserSearch } from "../../components";
import { combineIds } from "../../functions";
import { GeneralContext } from "../../contexts/GeneralContextProvider";
import { UserChatsContext } from "../../contexts/UserChatsContextProvider";

const Navbar = () => {
  // Window inner width served by general context provider.
  const {width} = useContext(GeneralContext);
  // userChats information of currentuser served by user chats context provider.
  const {requestsSent, filteredNotifications, notifications, notiCount} = useContext(UserChatsContext);
  // current user and loading state setter served by auth context provider.
  const {currentUser, setIsLoading} = useContext(AuthContext);
  // function to navigate through different routes.
  const navigate = useNavigate();

  const logoStyles = width > 574 ? {width: 100, height: 100} : {width: 70, height: 70};

  let notiStyle: string;
  let iconStyle: string;
  if(notiCount) {
    notiStyle = "notification-active";
    iconStyle = "navbar-icon-noti";
  } else {
    notiStyle = "d-none",
    iconStyle = "navbar-icon"
  }

  // State for showing input field or not, (responsive purposes)
  const [showInput, setShowInput] = useState<boolean>(false);
  // State for showing "X" button or not (logical purposes)
  const [showClose, setShowClose] = useState<boolean>(false);

  // Username for search.
  const [userName, setUserName] = useState<string>("");

  // User data that contains searched users.
  const [userData, setUserData] = useState<DocumentData[]>([]);

  // Handle sign out action.
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      // Set online status to false.
      const curUserStatusRef = doc(firestore, "userChats", currentUser!.uid);
      await updateDoc(curUserStatusRef, {
        isOnline: false
      });
      // Sign out the user.
      await signOut(auth);

      // Refresh the page to avoid white screen bug.
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle click on found user
  // const handleUserSave = async (targetUserData: DocumentData) => {
  //   try {
  //     // Clear everything after click.
  //     setUserName("");
  //     setUserData([]);

  //     // Update <current user's> <userChats's> <chats> array with clicked user's id.
  //     const currentUserChatsRef = doc(firestore, "userChats", currentUser?.uid!);
  //     await updateDoc(currentUserChatsRef, {
  //       chats: arrayUnion(targetUserData.uid)
  //     });
      
  //     // Update <target user's> <userChat's> <chats> array with current user's id. 
  //     const targetUserChatsRef = doc(firestore, "userChats", targetUserData.uid);
  //     await updateDoc(targetUserChatsRef, {
  //       chats: arrayUnion(currentUser?.uid)
  //     });

  //     // Generate combinedId for chat access purposes.
  //     const combinedId = combineIds(currentUser?.uid!, targetUserData.uid);
  //     // Chat will be saved with id value of combinedId.
  //     const chatsRef = doc(firestore, "chats", combinedId);
  //     await setDoc(chatsRef, {});
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  // Navigate to user's page.
  // const handleUserClick = (data: DocumentData) => {
  //   navigate(`/${data.uid}`);
  // }

  // Send friend request.
  const handleFriendRequest = async (userData: DocumentData) => {
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
      const currentUserDocRef = doc(firestore, "userChats", currentUser?.uid!);
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
      const currentUserDocRef = doc(firestore, "userChats", currentUser?.uid!);
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

  // handle notification reading.
  const handleNotificationRead = async () => {
    const batch = writeBatch(firestore);
    const currentUserDocRef = doc(firestore, "userChats", currentUser?.uid!);

    for(let timestamp of Object.keys(filteredNotifications)) {
      if(timestamp){
        const timestampNotification = filteredNotifications[timestamp];
        console.log(timestampNotification);

        if(!timestampNotification["isRead"]) {
          const from = timestampNotification["from"];
          const type = timestampNotification["type"];

          const updateChunk: any = {notifications};
          updateChunk.notifications[from][type]["isRead"] = true;

          batch.update(currentUserDocRef, updateChunk);

        } else {
          break;
        }
      }
    }

    batch.commit();
  }

  return (
    <div className="d-flex flex-column w-100 navbar-wrapper">
      <div className="navbar py-0 px-md-5 px-sm-4 px-2 bg-primary position-fixed w-100 d-flex align-items-center">
        <div className="d-flex justify-content-between align-items-center h-100">
          {width > 768 || !showInput ? <img style={logoStyles} className="mt-2" src={LogoWhite} alt="logo" /> : null}
          <UserSearch 
            className="mt-3 ms-md-3"
            userData={userData}
            setUserData={setUserData}
            userName={userName}
            setUserName={setUserName}
            setShowInput={setShowInput}
            showInput={showInput}
            showClose={showClose}
            setShowClose={setShowClose}
          />
        </div>
        {(width > 574 || !showInput) && <div className="d-flex align-items-center mt-3">
          <div onClick={handleNotificationRead} className="notifications d-flex align-items-center me-2 rounded">
            <span className={`${notiStyle} d-flex align-items-center justify-content-center rounded`}>{notiCount}</span>
            <IoIosNotifications className={`${iconStyle} me-0`} />
          </div>
          <img className="user-photo rounded-circle me-1" src={currentUser?.photoURL!} alt="user photo" />
          <NavDropdown className="navbar-button" title={currentUser?.displayName} id="nav-dropdown">
            <NavDropdown.Item onClick={() => navigate("/profile")}>Your Profile</NavDropdown.Item>
            <NavDropdown.Item onClick={() => navigate("/friends")}>Friends</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleSignOut}>Sign Out</NavDropdown.Item>
          </NavDropdown>
        </div>}
      </div>
      <div className="position-fixed d-flex flex-column found-users-container mx-5 rounded">
        {userName && userData.map((userData: DocumentData, key: number) => {
          return <div key={key} className="found-users d-flex justify-content-between align-items-center my-1 py-2 px-2">
            <div className="d-flex align-items-center">
              <img className="me-1 image" src={userData.photoURL} alt="user image" />
              <p className="fw-600 ms-1 me-5 mb-0">{userData.displayName}</p>
            </div>
            {!requestsSent?.includes(userData.uid) ?
              <button onClick={() => handleFriendRequest(userData)} className="friend-request d-flex align-items-center">
                <IoMdPersonAdd className="friend-request-icon" />
                Send Friend Request
              </button>
            :
              <button onClick={() => handleCancelFriendRequest(userData)} className="friend-request d-flex align-items-center">
                <IoMdClose className="friend-request-icon" />
                Cancel Friend Request
              </button>
            }
            </div>
        })}
      </div>
    </div>
  );
}

export default Navbar;