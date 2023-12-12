import { useState, useEffect, useContext } from "react";
import { query, collection, onSnapshot, where, DocumentData, doc, getDoc } from "firebase/firestore";
import { firestore } from "../../config/firebase";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { MessagingWindow } from "..";
import { FaUsersRectangle, FaRegRectangleXmark } from "react-icons/fa6"
import { GeneralContext } from "../../contexts/GeneralContextProvider";

const Contacts = (props: {
  className?: string
}) => {
  // context for retrieving currentuser info.
  const {currentUser} = useContext(AuthContext);
  // width for retrieving window innerwidth.
  const {width} = useContext(GeneralContext);

  // showUsers state for showing contacts or not.
  const [showContacts, setShowContacts] = useState<boolean>(false);
  // State for showing messaging window or not.
  const [showMessagingWindow, setShowMessagingWindow] = useState<boolean>(false);
  // User state of which we chose to chat with.
  const [user, setUser] = useState<DocumentData | null>(null);
  // State for currentUser chats, which is an array of strings (users' ids)
  const [userIdArray, setUserIdArray] = useState<string[]>([]);
  // State for storing ids of online users
  const [online, setOnline] = useState<string[]>([]);

  useEffect(() => {
    const qry = query(collection(firestore, "userChats"), where("friends", "array-contains", currentUser?.uid));
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

  // State for user information storing (whole user object)
  const [userData, setUserData] = useState<(DocumentData | undefined)[]>([]);

  useEffect(() => {
    // Fetch all the current users already stored.
    const fetchData = async () => {
      try {
        // we can't use await on map function therefore we have to store
        // it in a variable.
        const promises = userIdArray.map(async (userId:string) => {
          const docRef = doc(firestore, "users", userId);
          const userInfo = (await getDoc(docRef)).data();

          return userInfo;
        });

        // result is the all resolved value from promises.
        const result = await Promise.all(promises);

        // update user data.
        setUserData(result);
      } catch (err) {
        console.error(err);
      }
    }

    // run the function
    fetchData();
  }, [userIdArray]);
  
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
              {userData.map((userInfo: DocumentData | undefined, key: number) => {
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
      {showMessagingWindow ? <MessagingWindow styles={messagingWindowStyles} online={online} setShowMessagingWindow={setShowMessagingWindow} user={user} classname="position-fixed bottom-0 end-0 me-md-5 bg-primary" /> : null}
    </>
  );
}

export default Contacts;