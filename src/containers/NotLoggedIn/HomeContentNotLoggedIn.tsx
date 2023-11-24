import { Link } from "react-router-dom";
import { LogoPinkish } from "../../assets/images";
import { Button } from "react-bootstrap";
import { TextBox } from "../../components";

const HomeContentNotLoggedIn = () => {
  return (
    <div className="container">
      <div className="row h-100 d-flex align-items-center flex-column flex-lg-row">
        <img src={LogoPinkish} alt="logo" className="mx-auto w-50 col mt-md-0 mt-5"/>
        <div className="d-flex flex-column h-75 mt-5 col text-lg-start text-center">
          <h1 className="m-0 gradient-text">Connect-Engage-Enjoy</h1>
          <p className="fs-5 my-4 text-secondary header-description">El Chatto Matto: Your premier platform for engaging discussions and meaningful connections. Unlock a world of interactivedialogue and diverse perspectives, fostering enriching conversations within a dynamic community</p>
          <div className="d-flex mt-5 mt-lg-0 gap-lg-5 gap-3 flex-lg-row flex-column">
            <Link to="/login"><Button variant="outline-secondary px-4 custom-button w-100">Sign In</Button></Link>
            <Link to="/register"><Button variant="outline-secondary px-4 custom-button w-100">Sign Up</Button></Link>
          </div>
        </div>
      </div>
      <div className="row text-box-container g-3 my-5 pt-lg-5 pb-0 mb-lg-0 mb-5">
        <div className="col-lg-4">
          <TextBox header="Connect" text="Connect seamlessly with like-minded individuals, fostering meaningful relationships and collaborative experiences." />
        </div>
        <div className="col-lg-4">
          <TextBox header="Engage" text="Engage actively in discussions, where your voice matters, and explore diverse perspectives that ignite curiosity." />
        </div>
        <div className="col-lg-4">
          <TextBox header="Enjoy" text="Enjoy an enriching experience, where learning meets delight, making every interaction a source of joy and discovery." />
        </div>
      </div>
    </div>
  );
}

export default HomeContentNotLoggedIn;