import { LinkedIn, Envelope, GitHub } from "../../assets/images";

const Footer = () => {
  return(
    <div className="px-5 py-2 bg-primary footer">
      <h3 className="text-secondary mt-4 mb-2 display-5">Contact</h3>
      <div className="contact">
        <img src={LinkedIn} alt="linked in" />
        <img src={Envelope} alt="email" />
        <img src={GitHub} alt="github" />
      </div>
    </div>
  );
}

export default Footer;