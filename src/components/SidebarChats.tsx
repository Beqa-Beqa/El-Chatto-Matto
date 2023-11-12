import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContextProvider";
import { UserChatsContext } from "../contexts/UserChatsContextProvider";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../config/firebase";
import { DocUser } from "../interfaces/UserInterfaces";


const SidebarChats = (props: {
  setUser: React.Dispatch<React.SetStateAction<DocUser | null>>
}) => {
  const {currentUser} = useContext(AuthContext);
  const {chats} = useContext(UserChatsContext);

  const [userData, setUserData] = useState<DocUser[]>([]);

  useEffect(() => {
    // Fetch all the current users already stored.
    const fetchData = async () => {
      const curUserChatsRef = doc(firestore, "userChats", currentUser?.uid!);
      const data = (await getDoc(curUserChatsRef)).data()!.chats;

      const promises = data.map(async (userId:string) => {
        const docRef = doc(firestore, "users", userId);
        const userInfo = (await getDoc(docRef)).data();

        return userInfo;
      });

      const result = await Promise.all(promises);
      setUserData(result);
    }

    fetchData();
  }, [chats]);

  return (
    <div className="sidebar-chats">
      {userData.map((userInfo: DocUser, key: number) => {
        return <div onClick={() => props.setUser(userInfo)} key={key} className="found-users d-flex align-center pt-1 pb-1">
          <img className="ml-1" src={userInfo.photoURL} alt="user image" />
          <p className="fs-1 fw-600 ml-1">{userInfo.displayName}</p>
        </div>
      })}
    </div>
  );
}

export default SidebarChats;