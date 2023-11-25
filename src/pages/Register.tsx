import { useState, useContext } from "react";
import { CiImageOn } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth, firestore, storage } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { AuthContext } from "../contexts/AuthContextProvider";
import { genSubStrings } from "../functions";
import { Button } from "react-bootstrap";


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
  const [err, setErr] = useState<boolean>(false);
  // UseContext for loading state managment.
  const {setIsLoading} = useContext(AuthContext);
  

  // Handle registration of the user with email and password.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Prevent default action of form submit.
    event.preventDefault();
    // Set loading state to true to show spinning circle.
    setIsLoading(true);
    
    try {
      // Try and create account for the user with given email and password.
      // Upload data on firestore about the user.
      const userData = await createUserWithEmailAndPassword(auth, email, password);

      // Upload user image on firebase storage if image exists, if not use default one.
      let downloadUrl: Promise<string> | string;

      if(image) {
        // Upload image.
        const imageRef = ref(storage, `userImages/${userData.user.uid}.img`);
        await uploadBytesResumable(imageRef, image);

        // Get download url
        const url = await getDownloadURL(imageRef);
        downloadUrl = url;

      } else {
        // Set default image if no image is provided.
        const defaultImage = ref(storage, "userImages/user-icon.jpg");
        downloadUrl = await getDownloadURL(defaultImage)
      }

      // Save user data on firestore.
      const docRef = doc(firestore, "users", userData.user.uid);
      await setDoc(docRef, {
        uid: userData.user.uid,
        displayName: username,
        email: email,
        photoURL: downloadUrl,
        searchArray: genSubStrings(username)
      });

      // Update user's profile.
      await updateProfile(auth.currentUser!, {
        displayName: username,
        photoURL: downloadUrl
      });

      // Set userChat info for user, isOnline, isWriting for chatting purposes.
      const userChatRef = doc(firestore, "userChats", userData.user.uid!);
      await setDoc(userChatRef, {
        chats: [],
        isOnline: true,
        isWriting: false,
      });

      // Send user a verification email.
      await sendEmailVerification(userData.user);

      // If successfull navigate to homepage.
      navigate("/");

    } catch (error) {
      // If any errors, catch and log them, set error state to true.
      console.error(error);
      setErr(true);

    } finally {
      // Set loading state to false to remove spinning circle.
      setIsLoading(false);
    }
  }

   return (
    <div id="register" className="d-flex justify-content-center align-items-center bg-primary">
      <div className="form d-flex flex-column sign-form rounded p-4 container">
        <h1 className="gradient-text text-center fs-3">El Chatto Matto</h1>
        <span className="text-center mb-3 fs-3 text-primary fs-4">Register</span>
        <form onSubmit={handleSubmit} className="d-flex flex-column align-center w-100">
          <input className="input" onChange={(e) => setUsername(e.target.value)} value={username} type="text" placeholder="Username" />
          <input className="input" onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Email" />
          <input className="input" onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder="Password" />
          <label className="upload-image-label d-flex align-items-center mx-auto mb-1 justify-content-center" htmlFor="fileInput">
            <CiImageOn className="icon" />
            <span className="mx-2">Upload an image</span>
          </label>
          <input id="fileInput" className="d-none" onChange={(e) => {
            const image = e.target.files ? e.target.files[0] : null;
            setImage(image);
          }} type="file" />
          <Button type="submit" className="w-100 sign-button" variant="outline-primary">Sign Up</Button>
          {err && <span>Something went wrong!</span>}
        </form>
        <p className="text-center mt-2 mb-0">Already have an account? <Link className="link-button" to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}

export default Register