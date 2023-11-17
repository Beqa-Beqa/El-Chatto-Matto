import { useState, useEffect, useContext } from "react";
import { firestore } from "../config/firebase";
import { arrayUnion, collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { DocUser } from "../interfaces/UserInterfaces";
import { AuthContext } from "../contexts/AuthContextProvider";
import { combineIds } from "../functions";

const SidebarChats = () => {
  // Username for search.
  const [userName, setUserName] = useState<string>("");
  // User data that contains searched users.
  const [userData, setUserData] = useState<DocUser[]>([]);
  // Context for getting information about current user.
  const {currentUser} = useContext(AuthContext);

  const getUserData = async () => {
    if(userName) {
      const filterUsername = (str: string) => {
        // Transform to lowercase.
        const lowerCase = str.toLowerCase();
        // Trim any whitespaces.
        const trimmed = lowerCase.trim();
        // Split it without duplicate whitespaces, (OR WORD, I HOPE IT WON'T CAUSE A BUG).
        const splitted = Array.from(new Set(trimmed.split(" ")));
        // Join back together
        const joined = splitted.join(" ");

        return joined;
      }

      // Collection refference and creating AND query.
      const colRef = collection(firestore, "users");
      const qry = query(
        colRef,
        where("searchArray", "array-contains", filterUsername(userName)),
        where("uid", "!=", currentUser?.uid)
      );
    
      try {
        // Temporary array to store information.
        const temporarArr: any = [];
        // snapshot encapsulates all the data retrieved from query (qry) request.
        const snapshot = await getDocs(qry);
        // Loop through encapsulated data and store them in temporary array.
        // Retrieve data with doc.data().
        snapshot.forEach((doc) => {
          temporarArr.push(doc.data());
        });
        // Update state so that data will be avaliable through this component globally.
        setUserData(temporarArr);
      } catch (err) {
        // Any errors? log them. :]
        console.error(err);
      }
    }
  }

  // Useffect calls getUserData anytime when username for search field changes.
  useEffect(() => {
    getUserData();
  }, [userName]);

  // Handle click on found user
  const handleUserClick = async (targetUserData: DocUser) => {
    try {
      // Clear everything after click.
      setUserName("");
      setUserData([]);

      // Update <current user's> <userChats's> <chats> array with clicked user's id.
      const currentUserChatsRef = doc(firestore, "userChats", currentUser?.uid!);
      await updateDoc(currentUserChatsRef, {
        chats: arrayUnion(targetUserData.uid)
      });
      
      // Update <target user's> <userChat's> <chats> array with current user's id. 
      const targetUserChatsRef = doc(firestore, "userChats", targetUserData.uid);
      await updateDoc(targetUserChatsRef, {
        chats: arrayUnion(currentUser?.uid)
      });

      // Generate combinedId for chat access purposes.
      const combinedId = combineIds(currentUser?.uid!, targetUserData.uid);
      // Chat will be saved with id value of combinedId.
      const chatsRef = doc(firestore, "chats", combinedId);
      await setDoc(chatsRef, {});
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <input placeholder="Find users" className="w-100 bg-tertiary-6 border-none outline-none fs-1 p-1 text-tertiary" type="text" onChange={(e) => setUserName(e.target.value)} value={userName} />
      {userName && userData.map((data: DocUser, key: number) => {
        return <div onClick={() => handleUserClick(data)} key={key} className="found-users d-flex align-center pt-1 pb-1">
          <img className="ml-1 image" src={data.photoURL} alt="user image" />
          <p className="fs-1 fw-600 ml-1">{data.displayName}</p>
        </div>
      })}
      <hr />
    </div>
  );
}

export default SidebarChats;