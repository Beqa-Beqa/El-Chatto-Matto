import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextProvider";


const SidebarChats = () => {
  const {currentUser} = useContext(AuthContext);

  return (
    <div className="sidebar-chats">
    </div>
  );
}

export default SidebarChats;