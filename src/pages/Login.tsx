import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, firestore, googleProvider} from "../config/firebase";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { genSubStrings } from "../functions/general";
import { Button } from "react-bootstrap";

const Login = () => {
  // Error state used for conditional rendering if error occurs.
  const [err, setErr] = useState<boolean>(false);
  // Email state for user input.
  const [email, setEmail] = useState<string>("");
  // Password state for user input.
  const [password, setPassword] = useState<string>("");
  // navigate hook to navigate through different routes.
  const navigate = useNavigate();

  // Sign in handler.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submit action.
    event.preventDefault();
    // setIsLoading(true);

    try {
      // Try to sign in user to it's account.
      const signedUser = await signInWithEmailAndPassword(auth, email, password);
      // Update user's online status.
      const curUserStatusRef = doc(firestore, "userChats", signedUser.user.uid);
      await updateDoc(curUserStatusRef, {
        isOnline: true,
        isAway: false
      });
      // If successfull navigate to homepage.
      navigate("/");
    } catch (err) {
      // Otherwise log an error and set error state to true.
      console.error(err);
      setErr(true);
    } finally {
      // setIsLoading(false);
    }
  }

  // Google sign in handler, everything is same except this signs in user with google account.
  const handleGoogleSignIn = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

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
          defaultPhotoURL: signedUser.user.photoURL,
          uid: signedUser.user.uid,
          searchArray: genSubStrings(signedUser.user.displayName!)
        });

      // If the user docs does not exists, therefore user chats does not exist as well so we create one.
      // isOnline and isWriting are for chatting purposes.
      !existingDoc.exists() ?
        await setDoc(doc(firestore, "userChats", signedUser.user.uid), {
          chats: [],
          isOnline: true,
          isAway: false
        })
      : 
        await updateDoc(doc(firestore, "userChats", signedUser.user.uid), {
          isOnline: true,
          isAway: false,
        });

      navigate("/");
    } catch (err) {
      console.error(err);
      setErr(true);
    }
  }

  return (
    <div id="login" className="d-flex justify-content-center align-items-center">
      <div className="bg-image" />
      <div className="bg-color" />
      <div className="form d-flex flex-column sign-form rounded p-4 container">
        <h1 className="gradient-text text-center fs-3">El Chatto Matto</h1>
        <span className="text-center mb-3 fs-3 text-primary fs-4">Sign In</span>
        {err && <span className="error">Invalid Credentials</span>}
        <form onSubmit={handleSubmit} className="d-flex flex-column align-center w-100">
          <input className="input" onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Email" />
          <input className="input" onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder="Password" />
          <Button type="submit" className="w-100 sign-button mb-1" variant="outline-primary">Sign In</Button>
        </form>
        <Button type="submit" onClick={handleGoogleSignIn} className="w-100 sign-button mt-2" variant="outline-primary" >Sign In With Google</Button>
        <p className="text-center mt-2 mb-0">Don't have an account? <Link className="link-button" to="/register">Sign Up</Link></p>
      </div>
    </div>
  );
}

export default Login;