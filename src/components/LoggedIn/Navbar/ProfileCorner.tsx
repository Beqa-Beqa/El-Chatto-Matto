import { useContext } from "react";
import { NavDropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContextProvider";
import { firestore, auth } from "../../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";

const ProfileCorner = () => {
  const {currentUser, setIsLoading} = useContext(AuthContext);
  const {setTrigger} = useContext(RemoteUserContext);
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
        isOnline: false,
        isAway: false
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
    <NavDropdown 
      style={{userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none"}} 
      className="navbar-button"
      title={<div className="d-flex align-items-center gap-2"><img style={{userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none"}} className="user-photo rounded-circle me-1" src={currentUser?.photoURL!} alt="user photo" /> {currentUser?.displayName}</div>}
      id="nav-dropdown"
    >
      <NavDropdown.Item onClick={() => {setTrigger(prev => !prev); navigate(`/${currentUser?.uid}`);}}>Your Profile</NavDropdown.Item>
      <NavDropdown.Item onClick={() => navigate("/friends")}>Friends</NavDropdown.Item>
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={handleSignOut}>Sign Out</NavDropdown.Item>
    </NavDropdown>
  );
}

export default ProfileCorner;