import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { firestore } from "../config/firebase";
import { AuthContext } from "./AuthContextProvider";

export const RemoteUserContext = createContext<{
  remUserGenInfo: UserDoc,
  remUserUserChatsInfo: UserChatsDoc,
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>,
  filteredUserProfileImages: {
      [date: number]: {
          url: string;
          ref: string;
      };
  }
}>({
  remUserGenInfo: {defaultPhotoURL: "", displayName: "", email: "", photoURL: "", searchArray: [], uid: ""},
  remUserUserChatsInfo: {friends: [], isAway: false, isOnline: false, requestsSent: []},
  setTrigger: () => {},
  filteredUserProfileImages: {}
});

const RemoteUserContextProvider = ({children}: any) => {
  // Current user.
  const {currentUser} = useContext(AuthContext);
  // Trigger for useEffect.
  const [trigger, setTrigger] = useState<boolean>(false);
  // Set general info and user chats info according to session storage, if data exists then set it as default value otherwise set empty object {}.
  const [remUserGenInfo, setRemUserGenInfo] = useState<UserDoc>(JSON.parse(window.sessionStorage.getItem("remUserGenInfo")!) || {});
  const [remUserUserChatsInfo, setRemUserUserChatsInfo] = useState<UserChatsDoc>(JSON.parse(window.sessionStorage.getItem("remUserUserChatsInfo")!) || {});

  // Filter images data with the specific data structure of this project.
  const filterImageData = (dataObj: {[url: string]: {date: number, ref: string}}) => {
    // Final object that will be returned.
    const finalObj: {[date: number]: {url: string, ref: string}} = {};

    // Reconstruct the object so that date will be set as key and it will be object containing
    // url and ref.
    const reconstructedObj = Object.keys(dataObj || {}).reduce((obj: {[date: number]: {url: string, ref: string}}, dwUrl: string) => {
      const date = dataObj[dwUrl].date;
      obj[date] = {
        url: dwUrl,
        ref: dataObj[dwUrl].ref
      };
      return obj;
    }, {});

    // Sort reconstructed object keys (dates) from biggest to lowest.
    const sortedObj = Object.keys(reconstructedObj).sort((a: string, b: string) => parseInt(b) - parseInt(a)) || [];
    // Assign finalObj keys accordingly.
    for(let key of sortedObj) {
      finalObj[parseInt(key)] = reconstructedObj[parseInt(key)];
    }

    // Return the result
    return finalObj;
  }

  const filteredUserProfileImages = remUserGenInfo.profileImageRefs && filterImageData(remUserGenInfo.profileImageRefs) || {};

  useEffect(() => {
    const fetchUser = async () => {
      if(currentUser) {
        // Document references for users and userChats of the give nuser based on userUid.
        const remoteUserUsersRef = doc(firestore, "users", window.location.pathname);
        const remoteUserUserChatsRef = doc(firestore, "userChats", window.location.pathname);

        // Fetch all the data.
        const remUserGenInfo = await getDoc(remoteUserUsersRef);
        const remUserUserChatsInfo = await getDoc(remoteUserUserChatsRef);

        const usersData = remUserGenInfo.data();
        const userChatsData = remUserUserChatsInfo.data();

        if(remUserGenInfo.exists() && remUserUserChatsInfo.exists() && remUserGenInfo !== usersData && userChatsData !== remUserUserChatsInfo) {
          // Update window session storage with fetched data.
          window.sessionStorage.setItem("remUserGenInfo", JSON.stringify(remUserGenInfo.data()));
          window.sessionStorage.setItem("remUserUserChatsInfo", JSON.stringify(remUserUserChatsInfo.data()));
          
          // Update states with fetched data.
          setRemUserGenInfo((remUserGenInfo.data() as UserDoc));
          setRemUserUserChatsInfo((remUserUserChatsInfo.data() as UserChatsDoc));
        }
      }
    }
    fetchUser();

    window.addEventListener("popstate", fetchUser);

    return () => window.removeEventListener("popstate", fetchUser);
  }, [trigger]);

  return <RemoteUserContext.Provider value={{remUserGenInfo, remUserUserChatsInfo, setTrigger, filteredUserProfileImages}}>
    {children}
  </RemoteUserContext.Provider>
}

export default RemoteUserContextProvider;