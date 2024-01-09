import { createContext, useContext, useEffect, useState } from "react"
import { AuthContext } from "./AuthContextProvider";
import { UserChatsContext } from "./UserChatsContextProvider";
import { DocumentData, collection, query, where, documentId, onSnapshot } from "firebase/firestore";
import { firestore } from "../config/firebase";
import { combineIds } from "../functions/general";

export const MessagesContext = createContext<{
  allMessagesData: {[key: string]: DocumentData} | null,
  readByData: {
    [key: string]: {
        readBy: {
            [key: string]: boolean;
        };
        unreadMessagesCount: number;
    };
  }
}>({
  allMessagesData: {},
  readByData: {}
});

const MessagesContextProvider = ({children}: any) => {
  // Current user data.
  const {currentUser} = useContext(AuthContext);
  // Current user's friedns id's array.
  const {friends} = useContext(UserChatsContext);
  // state for friends data update.
  const [allMessagesData, setAllMessagesData] = useState<{[key: string]: DocumentData} | null>(null);
  // state for if chat is read and unread message count.
  const [readByData, setReadByData] = useState<{
    [key: string]: {
      readBy: {
        [key: string]: boolean
      },
      unreadMessagesCount: number
    }}>({});

  // start listening to snapshots and update messages whenever message is sent from current user
  // or from remote user.
  useEffect(() => {
    if(friends.length) {
      // Collection reference.
      const colRef = collection(firestore, "chats");
      // Combine ids of current user and friends to reacht chats.
      const combIdArray = friends.map((friend) => combineIds(currentUser!.uid, friend));
      // Filter query with documentId which is in combIdArray. (fetch only friends chats and not others).
      const qry = query(colRef, where(documentId(), "in", combIdArray))

      // Listener for chats
      const unsubListener = onSnapshot(qry, (snapshot) => {
        const docsArray: {[key: string]: DocumentData} = {};
        const temporaryReadByData: any = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          // Replace currentUser id from combId to get friend id.
          // This is because we want to already have friend id straight away 
          // and not combining ids all the time.
          const friendId = doc.id.replace(currentUser!.uid, "");
          docsArray[friendId] = data;
          temporaryReadByData[`chatWith-${friendId}`] = data.isReadBy || {};
        });

        setReadByData(temporaryReadByData);
        setAllMessagesData(docsArray);
      });

      return () => unsubListener();
    }
  }, [friends])

  return <MessagesContext.Provider value={{allMessagesData, readByData}}>
    {children}
  </MessagesContext.Provider>
}

export default MessagesContextProvider;