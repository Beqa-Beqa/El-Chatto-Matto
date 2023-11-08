import { useState, useEffect } from "react";
import { firestore } from "../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const SidebarChats = () => {
  const [userName, setUserName] = useState<string>("");
  const [userData, setUserData] = useState<any>([]);
  
  const getUserData = async () => {
    const colRef = collection(firestore, "users");
    const qry = query(colRef, where("displayName", "array-contains-any", userName.split("")));
  
    try {
      const snapshot = await getDocs(qry);
      snapshot.forEach((doc) => {
        setUserData([doc.data()]);
      });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    userName && getUserData();
  }, [userName]);

  console.log(userData);

  return (
    <div>
      <input className="w-100 bg-transparent border-none outline-none fs-1 p-1 text-tertiary" type="text" onChange={(e) => setUserName(e.target.value)} value={userName} />
      <hr />
    </div>
  );
}

export default SidebarChats;