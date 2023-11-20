import { Link } from "react-router-dom";
import { LogoGrayNavbar } from "../../assets/images";

const Navbar = () => {
  return (
    <div className="navbar py-0 px-5 bg-primary position-fixed w-100">
      <img className="h-75" src={LogoGrayNavbar} alt="logo" />
      <div>
        <Link className="navbar-button me-3" to="/login">Sign In</Link>
        <Link className="navbar-button" to="/register">Sign Up</Link>
      </div>
    </div>
  );
}

export default Navbar;