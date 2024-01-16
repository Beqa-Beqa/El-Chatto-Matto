import { onSnapshot, doc, DocumentData, DocumentSnapshot, query, collection, where, getDocs, QueryDocumentSnapshot, startAfter, QuerySnapshot, orderBy } from "firebase/firestore";
import { useState, useEffect, createContext, useContext } from "react";
import { firestore } from "../config/firebase";
import { AuthContext } from "./AuthContextProvider";

export const UserChatsContext = createContext<{
  requestsSent: string[],
  friends: string[],
  notifications: any,
  filteredNotifications: any,
  notiCount: number,
  online: string[],
  away: string[],
  friendsData: (DocumentData | undefined)[],
  postsCount: number
}>({
  requestsSent: [],
  friends: [],
  notifications: {},
  filteredNotifications: {},
  notiCount: 0,
  online: [],
  away: [],
  friendsData: [],
  postsCount: 0
});

const UserChatsContextProvider = ({children}: any) => {
  // Current user information.
  const {currentUser} = useContext(AuthContext);
  // State for storing requests sent by current user.
  const [requestsSent, setRequestsSent] = useState<string[]>([]);
  // State for storing friends id's of currentuser.
  const [friends, setFriends] = useState<string[]>([]);
  // State for storing notifications of currentuser (unsorted, raw).
  const [notifications, setNotifications] = useState<any>({});
  // State for storing notifications of currentuser (sorted and converted).
  const [filteredNotifications, setFilteredNotifications] = useState<any>({});
  // State for storing notification count (notifications which are not read yet).
  const [notiCount, setNotiCount] = useState<number>(0);
  // State for storing ids of online users
  const [online, setOnline] = useState<string[]>([]);
  // State for storing ids of away users
  const [away, setAway] = useState<string[]>([]);
  // State for user information storing (whole user object)
  const [friendsData, setFriendsData] = useState<(DocumentData | undefined)[]>([]);
  // state for posts count.
  const [postsCount, setPostsCount] = useState<number>(0);

  // Set snapshot listeners and update information on currentUser change.
  useEffect(() => {
    if(currentUser) {
      // Current user's userChats doc reference.
      const docRef = doc(firestore, "userChats", currentUser.uid);
      // Document snapshot listener for updating: requestsSent, notifications and friends id's.
      const unsub = onSnapshot(docRef, (snapshot: DocumentSnapshot) => {
        const convertedData: DocumentData = snapshot.data()!;
        if(convertedData) {
          convertedData.requestsSent && setRequestsSent(convertedData.requestsSent);
          setNotifications(convertedData.notifications ? convertedData.notifications : {});
          convertedData.friends && setFriends(convertedData.friends);
          convertedData.postsCount && setPostsCount(convertedData.postsCount);
        }
      });

      // Query to capture users who has current user in their friend's list.
      const qry = query(collection(firestore, "userChats"), where("friends", "array-contains", currentUser?.uid));
      // Query snapshot listener
      const unsubUserInfoListener = onSnapshot(qry, (querySnapshot) => {
        // All data array recieved from snapshot listener
        const dataArr: DocumentData[] = [];
        // querysnapshot is collection of DocumentData.
        querySnapshot.forEach((data) => {
          dataArr.push(data);
        });
        // Filter data based on online status.
        const onlineArr: string[] = dataArr.filter((userObj: DocumentData) => userObj.data().isOnline).map((userObj: DocumentData) => userObj.id);
        // Filter data based on away status.
        const awayArr: string[] = dataArr.filter((userObj: DocumentData) => userObj.data().isAway).map((userObj: DocumentData) => userObj.id);
        // set online state as onlineArr. online state will be an array of users who are online.
        setOnline(onlineArr);
        // set away state as awayArr. away state will be an array of users who are away.
        setAway(awayArr);
      });

      // Snapshots cleaner
      return () => {
        unsubUserInfoListener();
        unsub();
      };
    }
  }, [currentUser]);

  // Filter notifications and update filteredNotification state on notifications state change.
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

    // Return filtered notifications based on notis (keys are timestamps therefore parsing and sorting is needed).
    const filteredNotis = Object.keys(notis).map((key) => parseInt(key)).sort((a: number, b: number) => b - a).reduce(
      (obj: any, key) => {
        obj[key] = notis[key];
        return obj;
      }, {}
    );

    setFilteredNotifications(filteredNotis);
  }, [notifications]);

  // Update notification count on filteredNotification state change.
  useEffect(() => {
    // Set notification count (number on notification icon) based on the notifications which are not read yet.
    setNotiCount(Object.keys(filteredNotifications).filter((key) => !filteredNotifications[key]["isRead"]).length)
  }, [filteredNotifications]);

  // Update friends data on friends id array change.
  useEffect(() => {
    // Fetch all the current users already stored in friends array.
    const fetchData = async () => {
      try {
        // Result array for updating friendsData state.
        const result: (DocumentData | undefined)[] = [];
        // last query document snapshot reference for startAfter().
        let lastDoc: QueryDocumentSnapshot | undefined = undefined;
        // collection reference.
        const usersCol = collection(firestore, "users");

        // While all the friends data is not fetched...
        while(result.length < friends.length) {

          // Set query based on lastDoc, if it exists use orderBy() and startAfter().
          const qry = lastDoc ? query(usersCol, orderBy("uid"), startAfter(lastDoc), where("uid", "in", friends)) : query(usersCol, where("uid", "in", friends));
          // Fetch all the data from query with getDocs() (async).
          const querySnapshot: QuerySnapshot = await getDocs(qry);
          // Push all the data to the results array.
          querySnapshot.forEach((doc: QueryDocumentSnapshot) => result.push(doc.data()));

          // Update last query document snapshot refrence to paginate data fetch and not lose any if it exceeds query limits.
          lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        }

        // update user data.
        setFriendsData(result);

      } catch (err) {
        console.error(err);
      }
    }

    // run the function
    fetchData();
  }, [friends]);

  return <UserChatsContext.Provider value={{requestsSent, friends, notifications, filteredNotifications, notiCount, online, away, friendsData, postsCount}}>
    {children}
  </UserChatsContext.Provider>
}

export default UserChatsContextProvider;