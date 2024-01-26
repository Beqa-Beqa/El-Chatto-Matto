import { useContext, useState } from "react";
import { LogoWhite } from "../../assets/images";
import { Notifications, ProfileCorner, UserSearch } from "../../components";
import { GeneralContext } from "../../contexts/GeneralContextProvider";
import { useNavigate } from "react-router-dom";
import { FaRegRectangleXmark } from "react-icons/fa6";
import { AiOutlineMessage } from "react-icons/ai";

const Navbar = (props: {showContacts?: boolean, setShowContacts?: React.Dispatch<React.SetStateAction<boolean>>}) => {
  const showContacts = props.showContacts;
  const setShowContacts = props.setShowContacts;
  // Window inner width served by general context provider.
  const {width} = useContext(GeneralContext);
  const navigate = useNavigate();

  // Styles for logo
  const logoStyles = width > 574 ? {width: 100, height: 100} : {width: 70, height: 70, top: 12};

  // State for showing input field or not, (responsive purposes)
  const [showInput, setShowInput] = useState<boolean>(false);
  // State for showing "X" button or not (logical purposes)
  const [showClose, setShowClose] = useState<boolean>(false);

  return (
    <div className="d-flex flex-column w-100 navbar-wrapper">
      <div className="navbar py-0 px-md-5 px-sm-4 px-2 bg-primary position-fixed w-100 d-flex align-items-center">
        <div className="d-flex justify-content-between align-items-center h-100">
          <div className="w-100 h-100 logo-wrapper">
            {width > 768 || !showInput ? <img onClick={() => navigate("/")} style={logoStyles} className="logo" src={LogoWhite} alt="logo" /> : null}
          </div>
          <UserSearch 
            className="mt-3 ms-md-3"
            setShowInput={setShowInput}
            showInput={showInput}
            showClose={showClose}
            setShowClose={setShowClose}
          />
        </div>
        {(width > 574 || !showInput) && <div className="d-flex align-items-center mt-3 gap-1">
          {width < 992 && setShowContacts && showContacts && <FaRegRectangleXmark style={{width: 25, height: 25}} className="navbar-icon" onClick={() => setShowContacts(false)} />}
          {width < 992 && setShowContacts && !showContacts && <AiOutlineMessage style={{width: 25, height: 25}} className="navbar-icon" onClick={() => setShowContacts(true)} />}
          <Notifications />
          <ProfileCorner />
        </div>}
      </div>
    </div>
  );
}

export default Navbar;