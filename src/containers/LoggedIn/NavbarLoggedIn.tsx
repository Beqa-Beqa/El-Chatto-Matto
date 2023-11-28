import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { signOut } from "firebase/auth";
import { auth, firestore } from "../../config/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { LogoWhite } from "../../assets/images";
import { NavDropdown } from "react-bootstrap";

const Navbar = () => {
  const {currentUser, setIsLoading} = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      // Set online status to false.
      const curUserStatusRef = doc(firestore, "userChats", currentUser!.uid);
      await updateDoc(curUserStatusRef, {
        isOnline: false
      });
      // Sign out the user.
      await signOut(auth);

      // Navigate back to homescreen, otherwise bug may occur of white screen after sign out.
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="navbar py-0 px-md-5 px-3 bg-primary position-fixed w-100">
      <img className="navbar-image" src={LogoWhite} alt="logo" />
      <div className="d-flex align-items-center">
        <img className="user-photo me-1 rounded-circle" src={currentUser?.photoURL!} alt="user photo" />
        <NavDropdown className="navbar-button" title={currentUser?.displayName} id="nav-dropdown">
          <NavDropdown.Item onClick={() => navigate("/profile")}>Your Profile</NavDropdown.Item>
          <NavDropdown.Item onClick={() => navigate("/friends")}>Friends</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item onClick={handleSignOut}>Sign Out</NavDropdown.Item>
        </NavDropdown>
      </div>
    </div>
  );
}

export default Navbar;