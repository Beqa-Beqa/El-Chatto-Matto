import { useState } from "react";
import { CiImageOn } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { UserCredential, createUserWithEmailAndPassword, reload, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth, firestore, storage } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { genSubStrings } from "../functions/general";
import { Button } from "react-bootstrap";
import { handleImageUpload } from "../functions/firebase";

const Register = () => {
  // Navigate state for navigating through different routes.
  const navigate = useNavigate();
  // Username state for user input.
  const [username, setUsername] = useState<string>("");
  // Email state for user input.
  const [email, setEmail] = useState<string>("");
  // Password state for user input.
  const [password, setPassword] = useState<string>("");
  // Image state for user input.
  const [image, setImage] = useState<null | File>(null);
  // Error state. Used for conditional rendering if error occurs.
  const [err, setErr] = useState<string>("");
  
  // Save user documents in database.
  const saveUserDocs = async (userData: UserCredential) => {
    // Upload user image on firebase storage if image exists, if not use default one.
    let downloadUrl: string | null | undefined;
    let imageRefString: string | null | undefined;
    
    const defaultImage = ref(storage, "userImages/user-icon.jpg");
    const defaultImageUrl = await getDownloadURL(defaultImage);

    const profileImageRefsObj: any = {};

    if(image) {
      // Get download url
      const urlAndRef = await handleImageUpload(firestore, storage, userData.user)("profile", image, {returnURL: true, returnRef: true});
      downloadUrl = urlAndRef?.url;
      imageRefString = urlAndRef?.ref;

      profileImageRefsObj[`${downloadUrl}`] = imageRefString;
    } else {
      // Set default image if no image is provided.
      downloadUrl = defaultImageUrl;
    }

    // Save user data on firestore.
    const docRef = doc(firestore, "users", userData.user.uid);
    
    await setDoc(docRef, {
      uid: userData.user.uid,
      displayName: username,
      email: email,
      photoURL: downloadUrl,
      defaultPhotoURL: defaultImageUrl,
      searchArray: genSubStrings(username),
      profileImageRefs: profileImageRefsObj
    });

    // Update user's profile.
    await updateProfile(auth.currentUser!, {
      displayName: username,
      photoURL: downloadUrl
    });

    // Set userChat info for user, isOnline, isWriting for chatting purposes.
    const userChatRef = doc(firestore, "userChats", userData.user.uid!);
    await setDoc(userChatRef, {
      friends: [],
      isOnline: true,
      isAway: false,
      notifications: {},
      requestsSent: []
    });

    // If successfull navigate to homepage.
    navigate("/");
  }

  // Handle registration of the user with email and password.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Prevent default action of form submit.
    event.preventDefault();

    try {
      // If username is not valid do throw an error.
      if(username.length < 3) {
        setErr("Short Username");
        throw new Error;
      } else if(username.length > 15) {
        setErr("Long Username");
        throw new Error;
      }

      // Try and create account for the user with given email and password.
      // Upload data on firestore about the user.
      const userData = await createUserWithEmailAndPassword(auth, email, password);
      // Send user a verification email.
      await sendEmailVerification(userData.user);
      
      // Save user documents in database if email is verified.
      const maxVerificationCheck = 200;
      let currentVerificationCheck = 0;
      while(currentVerificationCheck <= maxVerificationCheck || !userData.user.emailVerified) {
        currentVerificationCheck++;
        // Promise for 3seconds delay (does nothing, just delay).
        await new Promise(resolve => setTimeout(resolve, 3000));
        // reload user.
        await reload(userData.user);
        // if email is verified, save docs.
        if(userData.user.emailVerified) {
          await saveUserDocs(userData);
          break;
        } 
      }

      // If after timeout email is not verified, delete account.
      !userData.user.emailVerified && userData.user.delete();

    } catch (error: any) {
      // If any errors, catch and log them, set error state to true.
      console.error(error);
      if(error.code === "auth/weak-password") {
        setErr("Weak Password");
      } else if (error.code === "auth/invalid-email") {
        setErr("Invalid Email");
      } else if(error.code === "auth/email-already-in-use") {
        setErr("Email In Use");
      } else {
        setErr(prev => {
          if(prev !== "Short Username" && prev !== "Long Username") {
            return "Something Else";
          } else {
            return prev;
          }
        })
      }
    }
  }

  return (
    <div id="register" className="d-flex justify-content-center align-items-center bg-primary">
      <div className="bg-image" />
      <div className="bg-color" />
      <div className="form d-flex flex-column sign-form rounded p-4 container">
        <h1 className="gradient-text text-center fs-3">El Chatto Matto</h1>
        <span className="text-center mb-3 fs-3 text-primary fs-4">Register</span>
        <form onSubmit={handleSubmit} className="d-flex flex-column align-center w-100">
          {err === "Short Username" ? <span className="error">Username must be at least 3 letters long.</span> : err === "Long Username" ? <span className="error">Username must not be longer than 15 letters.</span> : null}
          <input className="input" onChange={(e) => setUsername(e.target.value)} value={username} type="text" placeholder="Username" />
          {err === "Email In Use" ? <span className="error">Email already in use</span> : err === "Invalid Email" ? <span className="error">Invalid Email</span> : null}
          <input className="input" onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Email" />
          {err === "Weak Password" ? <span className="error">Weak Password</span> : null}
          <input className="input" onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder="Password" />
          <label className="upload-image-label d-flex align-items-center mx-auto mb-1 justify-content-center" htmlFor="fileInput">
            <CiImageOn />
            <span className="mx-2">Upload an image</span>
          </label>
          <input id="fileInput" className="d-none" onChange={(e) => {
            const image = e.target.files ? e.target.files[0] : null;
            setImage(image);
          }} type="file" />
          <Button type="submit" className="w-100 sign-button" variant="outline-primary">Sign Up</Button>
          {err === "Something went wrong" && <span>Something went wrong!</span>}
        </form>
        <p className="text-center mt-2 mb-0">Already have an account? <Link className="link-button" to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}

export default Register