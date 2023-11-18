import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContextProvider";
import { DocumentData, collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { firestore } from "../config/firebase";


const SidebarChats = (props: {
  setUser: React.Dispatch<React.SetStateAction<DocumentData | null>>
}) => {
  // context for retrieving currentuser info.
  const {currentUser} = useContext(AuthContext);
  // State for currentUser chats, which is array of strings (users' ids)
  const [userDataArray, setUserDataArray] = useState<string[]>([]);
  // State for user information storing (whole user object)
  const [userData, setUserData] = useState<(DocumentData | undefined)[]>([]);
  // Online list state.
  const [online, setOnline] = useState<any>([]);

// CONTINUE FROM HERE -----------------------------------------------------------------------------

  useEffect(() => {
    // Document reference
    const curUserChatsRef = doc(firestore, "userChats", currentUser?.uid!);
    // Fetch all userIds in current user doc chats array on every update.
    const unsubChatsListener = onSnapshot(curUserChatsRef, (doc) => {
      setUserDataArray(doc.data()?.chats);
    });

    const qry = query(collection(firestore, "userChats"), where("chats", "array-contains", currentUser?.uid));
    const unsubStatusListener = onSnapshot(qry, (querySnapshot) => {
      const dataArr: any = [];
      querySnapshot.forEach((data) => {
        dataArr.push(data.data());
      });

      setOnline(dataArr);
    });

    // Snapshots cleaner
    return () => {
      unsubChatsListener();
      unsubStatusListener();
    };
  }, []);

  console.log(online);

// ------------------------------------------------------------------------------------------------

  useEffect(() => {
    // Fetch all the current users already stored.
    const fetchData = async () => {
      // we can't use await on map function therefore we have to store
      // it in a variable.
      const promises = userDataArray.map(async (userId:string) => {
        const docRef = doc(firestore, "users", userId);
        const userInfo = (await getDoc(docRef)).data();

        return userInfo;
      });

      // result is the all resolved value from promises.
      const result = await Promise.all(promises);

      // update user data.
      setUserData(result);
    }

    // run the function
    fetchData();
  }, [userDataArray]);

  return (
    <div className="sidebar-chats">
      {/* Map all user data and render them */}
      {userData.map((userInfo: DocumentData | undefined, key: number) => {
        return <div onClick={() => props.setUser(userInfo!)} key={key} className="found-users d-flex align-center pt-1 pb-1">
          <img className="ml-1 image" src={userInfo!.photoURL} alt="user image" />
          <p className="fs-1 fw-600 ml-1">{userInfo!.displayName}</p>
        </div>
      })}
    </div>
  );
}

export default SidebarChats;