import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextProvider";

const SidebarNavbar = () => {
  const {currentUser} = useContext(AuthContext);

  console.log(currentUser);

  return (
    <div className="sidebar-navbar bg-secondary d-flex align-center justify-space-evenly">
      <img className="w-100" src={currentUser?.photoURL!} alt="Profile image" />
      <p className="ml-1 fs-2 fw-6">{currentUser?.displayName}</p>
    </div>
  );
}

export default SidebarNavbar;