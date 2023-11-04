import { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <div id="login" className="d-flex justify-center align-center">
      <div className="form d-flex flex-column align-center">
        <h1>Logo</h1>
        <span>Login</span>
        <form className="d-flex flex-column align-center">
          <input className="input" onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Email" />
          <input className="input" onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder="Password" />
          <button type="submit" className="button-secondary">Sign In</button>
        </form>
        <p>Don't have an account? <Link className="sign-button" to="/register">Sign Up</Link></p>
      </div>
    </div>
  );
}

export default Login;