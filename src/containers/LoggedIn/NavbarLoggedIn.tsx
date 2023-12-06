import { useContext, useState } from "react";
import { LogoWhite } from "../../assets/images";
import { Notifications, ProfileCorner, UserSearch } from "../../components";
import { GeneralContext } from "../../contexts/GeneralContextProvider";
import { firestore } from "../../config/firebase";
import { doc, deleteField, writeBatch, arrayRemove, arrayUnion } from "firebase/firestore";
import { combineIds } from "../../functions";
import { AuthContext } from "../../contexts/AuthContextProvider";

const Navbar = () => {
  // Window inner width served by general context provider.
  const {width} = useContext(GeneralContext);
  const {currentUser} = useContext(AuthContext);

  // Current user's userChats document reference.
  const currentUserDocRef = doc(firestore, "userChats", currentUser?.uid!);

  // Styles for logo
  const logoStyles = width > 574 ? {width: 100, height: 100} : {width: 70, height: 70};

  // State for showing input field or not, (responsive purposes)
  const [showInput, setShowInput] = useState<boolean>(false);
  // State for showing "X" button or not (logical purposes)
  const [showClose, setShowClose] = useState<boolean>(false);
  
  // handle friend requests in notifications.
  const handleRequestAnswer = async (action: string, target: string, type="friendRequest") => {
    const batch = writeBatch(firestore);
    // Generate combinedId for chat access purposes.
    const combinedId = combineIds(currentUser?.uid!, target);
    // Chat will be saved with id value of combinedId.
    const chatsRef = doc(firestore, "chats", combinedId);

    // User's doc reference on whom we target action to.
    const actionTargetUser = doc(firestore, "userChats", target);
  
    // Remove request helper function.
    const removeRequest = async () => {
      try {
        // update chunk is what is sent for an update.
        const updateChunk: any = {};
        // delete the given field.
        updateChunk[`notifications.${target}.${type}`] = deleteField(); 
        // make update request in batch.
        batch.update(currentUserDocRef, updateChunk);
        
        // make update request in batch to remove current user's id from sent request's array
        // in target user's docs.
        batch.update(actionTargetUser, {
          requestsSent: arrayRemove(currentUser?.uid!)
        });
      } catch (err) {
        console.error(err);
      }
    }

    // If the user accepts request.
    if(action === "accept") {
      // write about helper function above.
      await removeRequest();

      // make an update in batch, add notification sender user's id in friends array of 
      // notification current user's userchats doc.
      batch.update(currentUserDocRef, {
        friends: arrayUnion(target)
      });
      
      // make an update in batch, add current user's id in friends array of 
      // notification sender's userchats doc.
      batch.update(actionTargetUser, {
        friends: arrayUnion(currentUser?.uid!)
      });

      // Set the document. (in this case create).
      batch.set(chatsRef, {});

    } else if (action === "decline") {
      // if answer is decline then just remove request.
      await removeRequest();

    } else if (action === "delete") {
      // Remove chat's document (users` chat with each other) from database.
      batch.delete(chatsRef);

      // Remove each other id's from both users friends array in documents.
      const currentUserUpdateChunk = {
        friends: arrayRemove(target)
      }

      const targetUserUpdateChunk = {
        friends: arrayRemove(currentUser?.uid)
      }

      batch.update(currentUserDocRef, currentUserUpdateChunk);
      batch.update(actionTargetUser, targetUserUpdateChunk);
    }

    // commit all the changes.
    await batch.commit();
  };

  return (
    <div className="d-flex flex-column w-100 navbar-wrapper">
      <div className="navbar py-0 px-md-5 px-sm-4 px-2 bg-primary position-fixed w-100 d-flex align-items-center">
        <div className="d-flex justify-content-between align-items-center h-100">
          {width > 768 || !showInput ? <img style={logoStyles} className="mt-2" src={LogoWhite} alt="logo" /> : null}
          <UserSearch 
            className="mt-3 ms-md-3"
            setShowInput={setShowInput}
            showInput={showInput}
            showClose={showClose}
            setShowClose={setShowClose}
            handleRequestAnswer={handleRequestAnswer}
          />
        </div>
        {(width > 574 || !showInput) && <div className="d-flex align-items-center mt-3">
          <Notifications handleRequestAnswer={handleRequestAnswer} />
          <ProfileCorner />
        </div>}
      </div>
    </div>
  );
}

export default Navbar;