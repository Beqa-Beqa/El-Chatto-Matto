import { useContext } from "react";
import { NavDropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContextProvider";
import { firestore, auth } from "../../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";
import { GeneralContext } from "../../../contexts/GeneralContextProvider";

const ProfileCorner = () => {
  const {currentUser, setIsLoading} = useContext(AuthContext);
  const {setTrigger} = useContext(RemoteUserContext);
  const {width} = useContext(GeneralContext);
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

  const title = <div className="d-flex align-items-center">
    <img style={{userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none"}} className="user-photo rounded-circle me-1" src={currentUser?.photoURL!} alt="user photo" /> 
    {width > 1024 ? currentUser?.displayName : width > 574 ? currentUser?.displayName?.split(" ")[0] : null}
  </div>

  return (
    <NavDropdown 
      style={{userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none"}} 
      className="navbar-button"
      title={title}
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