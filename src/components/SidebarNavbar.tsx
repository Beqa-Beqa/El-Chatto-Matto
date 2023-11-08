import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextProvider";

const SidebarNavbar = () => {
  const {currentUser} = useContext(AuthContext);

  return (
    <div className="sidebar-navbar bg-secondary d-flex align-center justify-space-evenly">
      <img className="w-100" src={currentUser?.photoURL!} alt="Profile image" />
      <p className="ml-1 fs-1 fw-6">{currentUser?.displayName}</p>
    </div>
  );
}

export default SidebarNavbar;