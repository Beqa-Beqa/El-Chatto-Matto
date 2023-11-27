import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { signOut } from "firebase/auth";
import { auth, firestore } from "../../config/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { Navigate } from "react-router-dom";

const Navbar = () => {
  const {currentUser, setIsLoading} = useContext(AuthContext);

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
      <Navigate to="/" />
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div id="navbar" className="d-flex align-center justify-space-between">
      <h1 className="fs-3">Logo</h1>
      <div className="authorisation d-flex align-center">
        <h3>Welcome</h3>
        <button onClick={handleSignOut} className="button-secondary">Sign Out</button>
      </div>
    </div>
  );
}

export default Navbar;