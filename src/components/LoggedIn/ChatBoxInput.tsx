import { useState, useContext, useEffect } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { combineIds } from "../../functions";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { DocumentData, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../config/firebase";

const ChatBoxInput = (props: {
  user: DocumentData | null,
}) => {
  // Current user context to get info of currentuser.
  const {currentUser} = useContext(AuthContext);
  // message state for written message in input field of message window (it's textarea actually).
  const [message, setMessage] = useState<string>("");
  // State for user if they are writing a message or not.
  const [writing, isWriting] = useState<boolean>(false);
  
  // We handle keydown to be able to send message with Enter.
  const handleKeyDown = async (event: any) => {
    // Combine ids to get respective id to reach database with proper value.
    const combId = combineIds(currentUser?.uid!, props.user?.uid!);
    if(event.code === "Enter" && !event.shiftKey) {
      // If enter is pressed and simultaneously shift is not pressed do the following:
      // (If shift was pressed it would just write a new line).
      const trimmedMessage = message.trim();
      // Trim the message first so there won't be any leading or ending whitespaces.
      if(trimmedMessage) {
        // Prevent event from default action, in this case writing a new line.
        event.preventDefault();
        // Clean message field.
        setMessage("");
        // doc ref to where to store message.
        const docRef = doc(firestore, "chats", combId);
        // Current date in unix format with which message and senderId will be stored.
        const curDate = new Date().getTime();
        // Prelimenarly make reference of docdata as an empty object, othervise we are not able
        // to use variables as keys in created objcet.
        const docData: any = {};
        // Create a new ket with curDate's value and set it as an object with message and senderid fields. 
        docData[curDate] = {
          senderId: currentUser?.uid,
          message: trimmedMessage
        }
        // Update document.
        await updateDoc(docRef, docData);
      } else {
        // If message is just an empty string or a whitespace it does nothing, not even new line is written.
        event.preventDefault();
        setMessage(message + `\n`);
      }
    }
  }

  // Same thing goes here as in handleKeyDown, except here we just click on react-icon's icon.
  const handleClick = async () => {
    // combine id.
    const combId = combineIds(currentUser?.uid!, props.user?.uid!);
    // trim message.
    const trimmedMessage = message.trim();
    // if message exists and it's not whitespace.
    if(trimmedMessage) {
      // clean message input field.
      setMessage("");
      // doc ref to which doc should be updated.
      const docRef = doc(firestore, "chats", combId);
      // date with which data is stored.
      const curDate = new Date().getTime();
      // create document reference as object.
      const docData: any = {};
      // create new field in docData with curDate's value and set it to an object with fields senderId, message.
      docData[curDate] = {
        senderId: currentUser?.uid,
        message: trimmedMessage
      }
      // update document
      await updateDoc(docRef, docData);
    }
  }

  useEffect(() => {
    const updateWritingStatus = async () => {
      // Current users userChats ref.
      const curUserChatsRef = doc(firestore, "userChats", currentUser?.uid!);
      try {
        if(message && !writing) {
          // If there is a message and writing state is set to false:
          isWriting(true);
          
          // Update current user writing status and set it to true.
          await updateDoc(curUserChatsRef, {
            isWriting: true,
          });
          
        } else if(!message && writing) {
          // If there is not a message and writing state is set to true:
          isWriting(false);
  
          // Update current user writing status and set it to false.
          await updateDoc(curUserChatsRef, {
            isWriting: false
          });
        }
      } catch (err) {
        console.error(err);
      }
    }

    updateWritingStatus();
  }, [message]);


  if(props.user) {
    return (
      <div className="py-2 px-1 d-flex align-items-center justify-content-around gap-2">
        <textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e)}
          className="chat-box-input rounded w-75"
         />
        <AiOutlineSend style={{width: 25, height: 25}} onClick={handleClick} />
      </div>
    );
  }
}

export default ChatBoxInput;