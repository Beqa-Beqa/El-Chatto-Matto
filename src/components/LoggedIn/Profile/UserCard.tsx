import { DocumentData } from "firebase/firestore";
import { IoPersonRemove } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import { useContext, useRef, useState } from "react";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";
import { useOutsideClick } from "../../../hooks";
import { deletePrompt } from "../../../App";
import { AuthContext } from "../../../contexts/AuthContextProvider";
import { firestore } from "../../../config/firebase";
import { handleRequestAnswer } from "../../../functions/firebase";

const UserCard = (props: {
  userData: DocumentData
}) => {
  // Current user info.
  const {currentUser} = useContext(AuthContext);
  // Trigger for triggering refetching info.
  const {setTrigger} = useContext(RemoteUserContext);
  // useNavigate for navigating through different urls with react-router.
  const navigate = useNavigate();

  // Set action prompt component visible or unvisible.
  const [actionPromptVisible, setActionPromptVisible] = useState<boolean>(false);
  // Prompt reference for useOutsideClick
  const promptRef = useRef<HTMLDivElement | null>(null);
  // See hooks folder for more details.
  useOutsideClick(promptRef, setActionPromptVisible, false);

  const yesAction = async () => {
    // Check functions/firebase.ts for more details about handleRequestAnswer.
    await handleRequestAnswer(firestore, currentUser!, "delete", props.userData.uid);
    setActionPromptVisible(false);
  }


  const noAction = () => {
    setActionPromptVisible(false);
  }

  return (
    <div className="user-card col-xxl-3 col-lg-4 col-md-6 col-12">
      <div className="user-card-border py-3 d-flex flex-column align-items-center rounded">
        <img className="rounded object-fit-cover" src={props.userData.photoURL} alt="user" />
        <h5 className="mt-3">{props.userData.displayName}</h5>
        <div className="d-flex gap-2 mt-2">
          <button onClick={() => {setTrigger(prev => !prev); navigate(`/${props.userData.uid}`);}} className="action-button rounded d-flex align-items-center">
            View Profile
            <CgProfile className="action-button-icon ms-md-2 ms-1" />
          </button>
          <button onClick={() => setActionPromptVisible(true)} className="action-button rounded d-flex align-items-center">
            Delete Friend
            <IoPersonRemove className="action-button-icon ms-md-2 ms-1" />
          </button>
        </div>
      </div>
      {actionPromptVisible && <div className="user-prompt" >
        <div ref={promptRef}>
          {deletePrompt(props.userData.displayName, yesAction, noAction)}
        </div>
      </div>}
    </div>
  );
}

export default UserCard;