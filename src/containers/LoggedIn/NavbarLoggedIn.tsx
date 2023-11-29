import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { signOut } from "firebase/auth";
import { auth, firestore } from "../../config/firebase";
import { updateDoc, doc, DocumentData, arrayUnion, setDoc, arrayRemove } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { LogoWhite } from "../../assets/images";
import { NavDropdown } from "react-bootstrap";
import { IoIosNotifications, IoMdPersonAdd, IoMdClose } from "react-icons/io";
import { UserSearch } from "../../components";
import { combineIds } from "../../functions";
import { GeneralContext } from "../../contexts/GeneralContextProvider";
import { UserChatsContext } from "../../contexts/UserChatsContextProvider";

const Navbar = () => {
  const {width} = useContext(GeneralContext);
  const {requestsSent, requestsRecieved} = useContext(UserChatsContext);

  const notifications = {
    requestsRecieved,
  };

  const [notiCount, setNotiCount] = useState<number>(requestsRecieved.length);

  const logoStyles = width > 574 ? {width: 100, height: 100} : {width: 70, height: 70};
  const notiStyle = notiCount > 0 ? {backgroundColor: "#FF4081", border: "1px solid white"} : {border: "1px solid white"};

  const [showInput, setShowInput] = useState<boolean>(false);
  const [showClose, setShowClose] = useState<boolean>(false);

  // Username for search.
  const [userName, setUserName] = useState<string>("");

  // User data that contains searched users.
  const [userData, setUserData] = useState<DocumentData[]>([]);

  const {currentUser, setIsLoading} = useContext(AuthContext);
  const navigate = useNavigate();

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

      // Navigate back to homescreen, otherwise bug may occur of white screen after sign out.
      navigate("/");
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
    try {
      // Save current user's id as recieved request in target user's array.
      const targetUserdocRef = doc(firestore, "userChats", userData.uid);
      await updateDoc(targetUserdocRef, {
        requestsRecieved: arrayUnion(currentUser?.uid!)
      });

      // Save target user's id as sent request in current user's array.
      const currentUserDocRef = doc(firestore, "userChats", currentUser?.uid!);
      await updateDoc(currentUserDocRef, {
        requestsSent: arrayUnion(userData.uid)
      });

    } catch (err) {
      console.log(err)
    }
  }

  // Cancel friend request.
  const handleCancelFriendRequest = async (userData: DocumentData) => {
    try {
      // Remove target user's id from sent requests array in current user docs.
      const currentUserDocRef = doc(firestore, "userChats", currentUser?.uid!);
      await updateDoc(currentUserDocRef, {
        requestsSent: arrayRemove(userData.uid)
      });
      // Remove current user's id from recieved requests array in target user docs.
      const targetUserdocRef = doc(firestore, "userChats", userData.uid);
      await updateDoc(targetUserdocRef, {
        requestsRecieved: arrayRemove(currentUser?.uid!)
      });

    } catch (err) {
      console.log(err);
    }
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
          <div onClick={() => setNotiCount(0)} style={notiStyle} className="notifications d-flex align-items-center me-2 rounded">
            <span className="d-flex align-items-center justify-content-center" style={{width: 20, height: 20}}>{notiCount > 0 ? notiCount : null}</span>
            <IoIosNotifications className="navbar-icon me-0" />
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
            {!requestsSent.includes(userData.uid) ?
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