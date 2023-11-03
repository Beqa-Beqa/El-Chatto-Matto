import Input from "../components/Input";
import { useState } from "react";

const Register = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <div id="register" className="d-flex justify-center align-center">
      <div className="form d-flex flex-column align-center">
        <h1>Logo</h1>
        <span>Register</span>
        <form className="d-flex flex-column">
          <Input value={username} type="text" placeholder="Username" />
          <Input value={email} type="email" placeholder="Email" />
          <Input value={password} type="password" placeholder="Password" />
          <button className="button-secondary">Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default Register