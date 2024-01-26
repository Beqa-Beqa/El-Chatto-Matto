import { useContext, useState } from "react";
import { Footer, FriendsContainer, NavbarLoggedIn } from "../containers";
import { GeneralContext } from "../contexts/GeneralContextProvider";
import { CiSearch } from "react-icons/ci";
import { IoMdClose } from "react-icons/io"

const Friends = () => {
  // Width of window
  const {width} = useContext(GeneralContext);
  // State for showing firends search input
  const [showInput, setShowInput] = useState<boolean>(false);
  // Input value state (controlled)
  const [inputValue, setInputValue] = useState<string>("");
  // State for showing close button (for friends search).
  const [showClose, setShowClose] = useState<boolean>(false);

  return(
    <div className="friends">
      <header>
        <NavbarLoggedIn />
      </header>
      <main className="home-content-logged-in mt-5 pt-5 px-md-5 px-sm-4 px-2 w-100 d-flex flex-column">
        <div className="d-flex justify-content-start align-items-center">
          {width > 574 || !showInput ? <h4 className="m-0" >Your friends on El Chatto Matto</h4> : null}
          {width > 574 || showInput ?
            <div className="ms-4 d-flex align-items-center">
              <input autoFocus onChange={(e) => {
                const target = e.target as HTMLInputElement;
                setInputValue(target.value);
                setShowClose(true);
              }} value={inputValue} style={{maxWidth: 189}} placeholder="Search Friends" className="border-0 px-1 w-100" type="text" />
              {showClose ? <IoMdClose onClick={() => {
                setInputValue("");
                setShowInput(false);
                setShowClose(false);
              }} className="ms-1 navbar-icon" />
              :
                <div className="ms-1 navbar-icon" />
              }
            </div>
          :
            <CiSearch style={{flexShrink: 0}} onClick={() => {
              setShowInput(true);
              setShowClose(true);
            }} className="navbar-icon ms-2" />
          }
        </div>
        <div className="mt-5 w-100">
          <FriendsContainer isOwner friendsPage filterBySearch={inputValue.toLowerCase().trim()} />
        </div>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Friends;