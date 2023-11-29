import { onSnapshot, doc, DocumentData, DocumentSnapshot } from "firebase/firestore";
import { useState, useEffect, createContext, useContext } from "react";
import { firestore } from "../config/firebase";
import { AuthContext } from "./AuthContextProvider";

export const UserChatsContext = createContext<{
  requestsSent: string[],
  requestsRecieved: string[],
  friends: string[],
}>({
  requestsSent: [],
  requestsRecieved: [],
  friends: []
});

const UserChatsContextProvider = ({children}: any) => {
  const {currentUser} = useContext(AuthContext);
  const [requestsSent, setRequestsSent] = useState<string[]>([]);
  const [requestsRecieved, setRequestsRecieved] = useState<string[]>([]);
  const [friends, setFriends] = useState<string[]>([]);

  useEffect(() => {
    if(currentUser) {
      const docRef = doc(firestore, "userChats", currentUser.uid);
      const unsub = onSnapshot(docRef, (snapshot: DocumentSnapshot) => {
        const convertedData: DocumentData = snapshot.data()!;
        if(convertedData) {
          setRequestsSent(convertedData.requestsSent);
          setRequestsRecieved(convertedData.requestsRecieved);
          setFriends(convertedData.friends);
        }
      });

      return () => unsub();
    }
  }, [currentUser]);

  return <UserChatsContext.Provider value={{requestsSent, requestsRecieved, friends}}>
    {children}
  </UserChatsContext.Provider>
}

export default UserChatsContextProvider;