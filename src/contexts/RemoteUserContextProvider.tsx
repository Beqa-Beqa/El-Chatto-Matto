import { DocumentData, doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { firestore } from "../config/firebase";
import { AuthContext } from "./AuthContextProvider";

export const RemoteUserContext = createContext<{
  remUserGenInfo: DocumentData,
  remUserUserChatsInfo: DocumentData,
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>
}>({
  remUserGenInfo: {},
  remUserUserChatsInfo: {},
  setTrigger: () => {}
});

const RemoteUserContextProvider = ({children}: any) => {
  // Current user.
  const {currentUser} = useContext(AuthContext);
  // Trigger for useEffect.
  const [trigger, setTrigger] = useState<boolean>(false);
  // Set general info and user chats info according to session storage, if data exists then set it as default value otherwise set empty object {}.
  const [remUserGenInfo, setRemUserGenInfo] = useState<DocumentData>(JSON.parse(window.sessionStorage.getItem("remUserGenInfo")!) || {});
  const [remUserUserChatsInfo, setRemUserUserChatsInfo] = useState<DocumentData>(JSON.parse(window.sessionStorage.getItem("remUserUserChatsInfo")!) || {});

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
          setRemUserGenInfo(remUserGenInfo.data());
          setRemUserUserChatsInfo(remUserUserChatsInfo.data());
        }
      }
    }
    fetchUser();

    window.addEventListener("popstate", fetchUser);

    return () => window.removeEventListener("popstate", fetchUser);
  }, [trigger]);

  return <RemoteUserContext.Provider value={{remUserGenInfo, remUserUserChatsInfo, setTrigger}}>
    {children}
  </RemoteUserContext.Provider>
}

export default RemoteUserContextProvider;