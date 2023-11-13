import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContextProvider";
import { UserChatsContext } from "../contexts/UserChatsContextProvider";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../config/firebase";
import { DocUser } from "../interfaces/UserInterfaces";


const SidebarChats = (props: {
  setUser: React.Dispatch<React.SetStateAction<DocUser | null>>
}) => {
  // context for retrieving currentuser info.
  const {currentUser} = useContext(AuthContext);
  // chats context just for update purposes, chats is nothing but a boolean value.
  const {chats} = useContext(UserChatsContext);
  // update user data whenever chats change. Chats change is triggered in sidebarsearch.tsx
  const [userData, setUserData] = useState<DocUser[]>([]);

  useEffect(() => {
    // Fetch all the current users already stored.
    const fetchData = async () => {
      // Document reference
      const curUserChatsRef = doc(firestore, "userChats", currentUser?.uid!);
      // Get data from doc reference and take chats array from it.
      const data = (await getDoc(curUserChatsRef)).data()!.chats;

      // we can't use await on map function therefore we have to store
      // it in a variable.
      const promises = data.map(async (userId:string) => {
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
  }, [chats]);

  return (
    <div className="sidebar-chats">
      {/* Map all user data and render them */}
      {userData.map((userInfo: DocUser, key: number) => {
        return <div onClick={() => props.setUser(userInfo)} key={key} className="found-users d-flex align-center pt-1 pb-1">
          <img className="ml-1 image" src={userInfo.photoURL} alt="user image" />
          <p className="fs-1 fw-600 ml-1">{userInfo.displayName}</p>
        </div>
      })}
    </div>
  );
}

export default SidebarChats;