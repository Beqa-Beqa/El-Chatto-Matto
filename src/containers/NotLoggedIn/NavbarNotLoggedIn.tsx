import { Link } from "react-router-dom";
import { LogoWhite } from "../../assets/images";

const Navbar = () => {
  return (
    <div className="navbar py-0 px-md-5 px-3 bg-primary position-fixed w-100">
      <img className="navbar-image" src={LogoWhite} alt="logo" />
      <div>
        <Link className="navbar-button me-3" to="/login">Sign In</Link>
        <Link className="navbar-button" to="/register">Sign Up</Link>
      </div>
    </div>
  );
}

export default Navbar;