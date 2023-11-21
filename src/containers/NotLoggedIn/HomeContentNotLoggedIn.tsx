import { Link } from "react-router-dom";
import { LogoPinkish } from "../../assets/images";
import { Button } from "react-bootstrap";
import { TextBox } from "../../components";

const HomeContentNotLoggedIn = () => {
  return (
    <>
      <div className="pt-5 px-5 d-flex align-items-center justify-content-around h-100">
        <img src={LogoPinkish} alt="logo image white" />
        <div className="d-flex flex-column h-75">
          <h1 className="m-0 gradient-text">Connect-Engage-Enjoy</h1>
          <p className="fs-5 my-4 text-secondary header-description">El Chatto Matto: Your premier platform for engaging discussions<br/>and meaningful connections. Unlock a world of interactivedialogue<br/>and diverse perspectives, fostering enriching conversations<br/>within a dynamic community</p>
          <div>
            <Link to="/login"><Button variant="outline-secondary px-4 me-5 custom-button">Sign In</Button></Link>
            <Link to="/register"><Button variant="outline-secondary px-4 ms-5 custom-button">Sign Up</Button></Link>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between text-box-container">
        <TextBox header="Connect" text="Connect seamlessly with like-minded individuals, fostering meaningful relationships and collaborative experiences." />
        <TextBox header="Engage" text="Engage actively in discussions, where your voice matters, and explore diverse perspectives that ignite curiosity." />
        <TextBox header="Enjoy" text="Enjoy an enriching experience, where learning meets delight, making every interaction a source of joy and discovery." />
      </div>
    </>
  );
}

export default HomeContentNotLoggedIn;