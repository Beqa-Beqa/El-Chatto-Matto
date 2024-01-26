import { DocumentData } from "firebase/firestore";
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
    <div className="user-card col-xxl-4 col-lg-6 col-md-4 col-6 h-100">
      <div onClick={() => {navigate(`/${props.userData.uid}`); setTrigger(prev => !prev)}} className="cursor-pointer user-card-border py-3 d-flex flex-column align-items-center rounded">
        <img className="rounded object-fit-cover" src={props.userData.photoURL} alt="user" />
        <span className="text-break displayname mt-3 text-center">{props.userData.displayName}</span>
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