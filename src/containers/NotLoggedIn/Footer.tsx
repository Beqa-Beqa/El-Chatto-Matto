import { LinkedIn, Envelope, GitHub } from "../../assets/images";

const Footer = () => {
  return(
    <div className="px-5 py-2 bg-primary footer">
      <h3 className="mt-3 mb-3 text-center w-100">Contact The Owner</h3>
      <div className="contact-link-wrapper w-100 text-center">
        <a target="_blank" href="https://www.linkedin.com/in/beka-aladashvili-30619525b/">
          <img src={LinkedIn} alt="linked in" />
        </a>
        <a className="mx-5" target="_blank" href="https://github.com/Beqa-Beqa">
          <img src={GitHub} alt="github" />
        </a>
        <a target="_blank" href="mailto:beka.aladashvili.383@gmail.com?subject=Job%20Offer">
          <img src={Envelope} alt="email" />
        </a>
      </div>
      <p className="text-center mb-0 mt-3">&copy; 2023 Beka Aladashvili. All rights reserved.</p>
    </div>
  );
}

export default Footer;