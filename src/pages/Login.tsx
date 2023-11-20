import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, firestore, googleProvider } from "../config/firebase";
import { AuthContext } from "../contexts/AuthContextProvider";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { genSubStrings } from "../functions";

const Login = () => {
  // Error state used for conditional rendering if error occurs.
  const [err, setErr] = useState<boolean>(false);
  // Email state for user input.
  const [email, setEmail] = useState<string>("");
  // Password state for user input.
  const [password, setPassword] = useState<string>("");
  // navigate hook to navigate through different routes.
  const navigate = useNavigate();
  // Usecontext to manage loading state.
  const {setIsLoading} = useContext(AuthContext);

  // Sign in handler.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submit action.
    event.preventDefault();
    setIsLoading(true);

    try {
      // Try to sign in user to it's account.
      const signedUser = await signInWithEmailAndPassword(auth, email, password);
      // Update user's online status.
      const curUserStatusRef = doc(firestore, "userChats", signedUser.user.uid);
      await updateDoc(curUserStatusRef, {
        isOnline: true
      });
      // If successfull navigate to homepage.
      navigate("/");
    } catch (err) {
      // Otherwise log an error and set error state to true.
      console.error(err);
      setErr(true);
    } finally {
      setIsLoading(false);
    }
  }

  // Google sign in handler, everything is same except this signs in user with google account.
  const handleGoogleSignIn = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      // Sign the user with google provider
      const signedUser = await signInWithPopup(auth, googleProvider);

      // Get info about the user from docs.
      const existingDoc = await getDoc(doc(firestore, "users", signedUser.user.uid));

      // If the user docs does not exists create user instance document in firestore.
      !existingDoc.exists() &&
        await setDoc(doc(firestore, "users", signedUser.user.uid), {
          displayName: signedUser.user.displayName!,
          email: signedUser.user.email,
          photoURL: signedUser.user.photoURL,
          uid: signedUser.user.uid,
          searchArray: genSubStrings(signedUser.user.displayName!)
        });

      // If the user docs does not exists, therefore user chats does not exist as well so we create one.
      // isOnline and isWriting are for chatting purposes.
      !existingDoc.exists() ?
        await setDoc(doc(firestore, "userChats", signedUser.user.uid), {
          chats: [],
          isOnline: true,
          isWriting: false
        })
      : 
        await updateDoc(doc(firestore, "userChats", signedUser.user.uid), {
          isOnline: true
        });

      navigate("/");
    } catch (err) {
      console.error(err);
      setErr(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div id="login" className="d-flex justify-center align-center">
      <div className="form d-flex flex-column align-center">
        <h1>Logo</h1>
        <span>Login</span>
        <form onSubmit={handleSubmit} className="d-flex flex-column align-center w-100">
          <input className="input" onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Email" />
          <input className="input" onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder="Password" />
          <button type="submit" className="button-secondary w-100 mt-2 mb-2">Sign In</button>
        </form>
        <button onClick={handleGoogleSignIn} className="w-100 mb-1 button-secondary">Sign In With Google</button>
        {err && <span>Something went wrong!</span>}
        <p>Don't have an account? <Link className="link-button" to="/register">Sign Up</Link></p>
      </div>
    </div>
  );
}

export default Login;