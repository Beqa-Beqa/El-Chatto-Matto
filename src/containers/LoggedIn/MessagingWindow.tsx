import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { SidebarChats, ChatBoxNavbar, ChatBoxMessages, ChatBoxInput } from "../../components";
import { DocumentData, query, collection, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../../config/firebase";

const MessagingWindow = () => {
  const [user, setUser] = useState<DocumentData | null>(null);
  // context for retrieving currentuser info.
  const {currentUser} = useContext(AuthContext);
  // State for currentUser chats, which is array of strings (users' ids)
  const [userIdArray, setUserIdArray] = useState<string[]>([]);
  // State for storing ids of online users
  const [online, setOnline] = useState<string[]>([]);

  
  useEffect(() => {
    const qry = query(collection(firestore, "userChats"), where("chats", "array-contains", currentUser?.uid));
    const unsubUserInfoListener = onSnapshot(qry, (querySnapshot) => {
      // All data array recieved from snapshot listener
      const dataArr: DocumentData[] = [];
      // querysnapshot is collection of DocumentData.
      querySnapshot.forEach((data) => {
        dataArr.push(data);
      });
      // Filter data based on online status.
      const filteredDataArr: string[] = dataArr.filter((userObj: DocumentData) => userObj.data().isOnline).map((userObj: DocumentData) => userObj.id);
      // set online state as filteredData. online state will be an array of users who are online.
      setOnline(filteredDataArr);
      // converted data arr is an array of all users who have current user in their chats (therefore this user has them too).
      const convertedDataArr = dataArr.map((userObj: DocumentData) => userObj.id);
      // set userIdArray to converted dat array.
      setUserIdArray(convertedDataArr);
    });

    // Snapshots cleaner
    return () => {
      unsubUserInfoListener();
    };
  }, []);

  return (
    <div id="messaging-window" className="d-flex bg-secondary-6 mt-3">
      <div className="side-bar">
        <SidebarChats setUser={setUser} userIdArray={userIdArray} online={online} />
      </div>
      <div className="chat-box">
        <ChatBoxNavbar user={user} online={online} />
        <ChatBoxMessages user={user} />
        <ChatBoxInput user={user} />
      </div>
    </div>
  );
}

export default MessagingWindow;