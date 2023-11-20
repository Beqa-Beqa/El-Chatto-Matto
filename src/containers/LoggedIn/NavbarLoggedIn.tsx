import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { signOut } from "firebase/auth";
import { auth, firestore } from "../../config/firebase";
import { updateDoc, doc } from "firebase/firestore";

const Navbar = () => {
  const {currentUser} = useContext(AuthContext);

  const handleSignOut = async () => {
    try {
      // Set online status to false.
      const curUserStatusRef = doc(firestore, "userChats", currentUser!.uid);
      await updateDoc(curUserStatusRef, {
        isOnline: false
      });
      // Sign out the user.
      await signOut(auth);
    } catch (err) {
      console.error(err);
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