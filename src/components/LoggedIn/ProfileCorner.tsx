import { useContext } from "react";
import { NavDropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { firestore, auth } from "../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

const ProfileCorner = () => {
  const {currentUser, setIsLoading} = useContext(AuthContext);
  // function to navigate through different routes.
  const navigate = useNavigate();

  // Current user's userChats document reference.
  const currentUserDocRef = doc(firestore, "userChats", currentUser?.uid!);

  // Handle sign out action.
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      // Set online status to false.
      await updateDoc(currentUserDocRef, {
        isOnline: false
      });
      // Sign out the user.
      await signOut(auth);

      // Refresh the page to avoid white screen bug.
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
  <>
    <img className="user-photo rounded-circle me-1" src={currentUser?.photoURL!} alt="user photo" />
    <NavDropdown className="navbar-button" title={currentUser?.displayName} id="nav-dropdown">
      <NavDropdown.Item onClick={() => navigate("/profile")}>Your Profile</NavDropdown.Item>
      <NavDropdown.Item onClick={() => navigate("/friends")}>Friends</NavDropdown.Item>
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={handleSignOut}>Sign Out</NavDropdown.Item>
    </NavDropdown>
  </>)
  ;
}

export default ProfileCorner;