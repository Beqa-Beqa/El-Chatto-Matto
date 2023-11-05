import { UserIcon } from "../assets/images";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextProvider";

const SidebarNavbar = () => {
  const {currentUser} = useContext(AuthContext);

  return (
    <div className="sidebar-navbar bg-tertiary d-flex align-center justify-space-evenly">
      <img className="w-100" src={UserIcon} alt="Profile image" />
      <p>asdasddas</p>
    </div>
  );
}

export default SidebarNavbar;