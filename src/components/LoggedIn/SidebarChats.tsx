import { useEffect, useState } from "react";
import { DocumentData, doc, getDoc } from "firebase/firestore";
import { firestore } from "../../config/firebase";


const SidebarChats = (props: {
  setUser: React.Dispatch<React.SetStateAction<DocumentData | null>>,
  userIdArray: string[],
  online: string[]
}) => {
  // State for user information storing (whole user object)
  const [userData, setUserData] = useState<(DocumentData | undefined)[]>([]);

  useEffect(() => {
    // Fetch all the current users already stored.
    const fetchData = async () => {
      try {
        // we can't use await on map function therefore we have to store
        // it in a variable.
        const promises = props.userIdArray.map(async (userId:string) => {
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
  }, [props.userIdArray]);

  return (
    <div className="sidebar-chats">
      {/* Map all user data and render them */}
      {userData.map((userInfo: DocumentData | undefined, key: number) => {
        return <div onClick={() => props.setUser(userInfo!)} key={key} className="found-users d-flex align-center pt-1 pb-1">
          <img className="ml-1 image" src={userInfo!.photoURL} alt="user image" />
          {props.online.includes(userInfo?.uid) && <div className="onlineCircle" />}
          <p className={props.online.includes(userInfo?.uid) ? "fs-1 fw-600" : "fs-1 fw-600 ml-1"}>{userInfo!.displayName}</p>
        </div>
      })}
    </div>
  );
}

export default SidebarChats;