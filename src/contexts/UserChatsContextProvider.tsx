import { onSnapshot, doc, DocumentData, DocumentSnapshot } from "firebase/firestore";
import { useState, useEffect, createContext, useContext } from "react";
import { firestore } from "../config/firebase";
import { AuthContext } from "./AuthContextProvider";

export const UserChatsContext = createContext<{
  requestsSent: string[],
  friends: string[],
  notifications: any,
  filteredNotifications: any,
  notiCount: number
}>({
  requestsSent: [],
  friends: [],
  notifications: {},
  filteredNotifications: {},
  notiCount: 0
});

const UserChatsContextProvider = ({children}: any) => {
  const {currentUser} = useContext(AuthContext);
  const [requestsSent, setRequestsSent] = useState<string[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any>({});
  const [filteredNotifications, setFilteredNotifications] = useState<any>({});
  const [notiCount, setNotiCount] = useState<number>(0);


  useEffect(() => {
    if(currentUser) {
      const docRef = doc(firestore, "userChats", currentUser.uid);
      const unsub = onSnapshot(docRef, (snapshot: DocumentSnapshot) => {
        const convertedData: DocumentData = snapshot.data()!;
        if(convertedData) {
          convertedData.requestsSent && setRequestsSent(convertedData.requestsSent);
          setNotifications(convertedData.notifications ? convertedData.notifications : {});
          convertedData.friends && setFriends(convertedData.friends);
        }
      });

      return () => unsub();
    }
  }, [currentUser]);

  useEffect(() => {
    // Filtered notifications for better sorting and filtering.
    const notis: any = {};

    // Keys of notifications forom each user (user is saved with reference of their ID in notification).
    const notisFrom: any = Object.keys(notifications);

    // If notifications exist (users who sent notification).
    if(notisFrom) {
      // Loop through all the users.
      for(let user of notisFrom) {
        // userNotis is an object of user who sent notifications.
        const userNotis = notifications[user];
        // notisFromUser are keys of user's notifications object. (for instance: "friendRequest": {timestamp: "random time", isRead: false})
        const notisFromUser = Object.keys(userNotis);

        // If notifications from user is present (notifications which was sent by that user, friend request, post like, etc...).
        if(notisFromUser) {
          // Loop through these keys.
          for(let noti of notisFromUser) {
            // Obtain time of send from notification object and save it as a reference in filteredNotis object 
            // (for instance: `random time: {type: "friendRequest", isRead: false}`).
            const timeOfSend = userNotis[noti].timestamp;
            notis[timeOfSend] = {
              type: noti,
              isRead: userNotis[noti].isRead,
              from: user
            };
          }
        }
      }
    }

    const filteredNotis = Object.keys(notis).map((key) => parseInt(key)).sort((a: number, b: number) => b - a).reduce(
      (obj: any, key) => {
        obj[key] = notis[key];
        return obj;
      }, {}
    );

    setFilteredNotifications(filteredNotis);
  }, [notifications]);

  useEffect(() => {
    setNotiCount(Object.keys(filteredNotifications).filter((key) => !filteredNotifications[key]["isRead"]).length)
  }, [filteredNotifications]);

  return <UserChatsContext.Provider value={{requestsSent, friends, notifications, filteredNotifications, notiCount}}>
    {children}
  </UserChatsContext.Provider>
}

export default UserChatsContextProvider;