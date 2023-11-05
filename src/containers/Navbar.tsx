import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextProvider";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

const Navbar = () => {
  const {currentUser} = useContext(AuthContext);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div id="navbar" className="d-flex align-center justify-space-between">
      <h1 className="fs-3">Logo</h1>
      <div className="authorisation d-flex align-center">
        { !currentUser ?
            <>
              <Link to="/login"><button className="button-secondary">Sign In</button></Link>
              <Link to="/register"><button className="button-secondary">Sign Up</button></Link>
            </>
          :
            <>
              <h3>Welcome</h3>
              <button onClick={handleSignOut} className="button-secondary">Sign Out</button>
            </>
        }
      </div>
    </div>
  );
}

export default Navbar;