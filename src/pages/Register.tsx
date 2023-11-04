import { useState } from "react";
import { UserIcon } from "../assets/images";
import { CiImageOn } from "react-icons/ci";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

const Register = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [image, setImage] = useState<null | File | String>(null);
  const [err, setErr] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      setErr(true);
    }
  }

  return (
    <div id="register" className="d-flex justify-center align-center">
      <div className="form d-flex flex-column align-center">
        <h1>Logo</h1>
        <span>Register</span>
        <form onSubmit={handleSubmit} className="d-flex flex-column align-center">
          <input className="input" onChange={(e) => setUsername(e.target.value)} value={username} type="text" placeholder="Username" />
          <input className="input" onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Email" />
          <input className="input" onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder="Password" />
          <label className="d-flex align-center" htmlFor="fileInput">
            <CiImageOn id="icon" />
            <span>Upload an image</span>
          </label>
          <input id="fileInput" className="d-none" onChange={(e) => {
            const image = e.target.files ? e.target.files[0] : UserIcon;
            setImage(image);
          }} type="file" />
          <button type="submit" className="button-secondary">Sign Up</button>
        </form>
        <p>Already have an account? <Link className="sign-button" to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}

export default Register