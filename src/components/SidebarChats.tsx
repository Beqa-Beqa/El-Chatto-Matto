import { useState, useEffect } from "react";
import { firestore } from "../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { DocUser } from "../interfaces/UserInterfaces";

const SidebarChats = () => {
  const [userName, setUserName] = useState<string>("");
  const [userData, setUserData] = useState<DocUser[]>([]);

  const getUserData = async () => {
    const colRef = collection(firestore, "users");
    const qry = query(colRef, where("displayName", "==", userName.toLowerCase()));
  
    try {
      const temporarArr: any = [];

      const snapshot = await getDocs(qry);
      snapshot.forEach((doc) => {
        temporarArr.push(doc.data());
      });

      setUserData(temporarArr);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    getUserData();
  }, [userName]);

  return (
    <div>
      <input placeholder="Find users" className="w-100 bg-tertiary-6 border-none outline-none fs-1 p-1 text-tertiary" type="text" onChange={(e) => setUserName(e.target.value)} value={userName} />
      {userData.map((data: DocUser, key: number) => {
        return <div key={key} className="found-users d-flex align-center pt-1 pb-1">
          <img className="ml-1" src={data.photoURL} alt="user image" />
          <p className="fs-1 fw-600 ml-1">{data.displayName}</p>
        </div>
      })}
      <hr />
    </div>
  );
}

export default SidebarChats;