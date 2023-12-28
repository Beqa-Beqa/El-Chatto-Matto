import { useState, useContext, useEffect } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { combineIds } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContextProvider";
import { DocumentData, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "../../../config/firebase";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { FaImage } from "react-icons/fa";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { GeneralContext } from "../../../contexts/GeneralContextProvider";
import Compressor from "compressorjs";
import uuid from "react-uuid";

const ChatBoxInput = (props: {
  user: DocumentData | null,
  messageRef: React.RefObject<HTMLDivElement> | null,
  dotsRef: React.RefObject<HTMLDivElement> | null,
  imageRef: React.RefObject<HTMLImageElement> | null
}) => {
  // Current user context to get info of currentuser.
  const {currentUser} = useContext(AuthContext);
  // window innerwidth
  const {width} = useContext(GeneralContext);
  // message state for written message in input field of message window (it's textarea actually).
  const [message, setMessage] = useState<string>("");
  // State for user if they are writing a message or not.
  const [isWriting, setIsWriting] = useState<boolean>(false);
  // Emoji picker state.
  const [showPicker, setShowPicker] = useState<boolean>(false);
  // Image to send state.
  const [image, setImage] = useState<File | null>(null);

  // Combine ids to get respective id to reach database with proper value.
  const combId = combineIds(currentUser?.uid!, props.user?.uid!);

  const scrollIntoView = () => {
    // if three dots ref (waiting for message) exists or message exists (last) or
    // image exists (last sent image), scroll to that view.
    props.dotsRef?.current ? props.dotsRef.current.scrollIntoView() :
    props.messageRef?.current ? props.messageRef.current.scrollIntoView() :
    props.imageRef?.current ? props.imageRef.current.scrollIntoView() :
    null;
  }

  // Handle image upload.
  const handleImageUpload = async (img: File) => {
    // Image reference where to save it, it's saved with unique uid.
    const imageRef = ref(storage, `sharedMedia/${combId}/${uuid()}.media`);

    try {
      // Compression
      await new Promise((resolve, reject) => {new Compressor(img, {
        quality: 0.6,
        // The compression process is asynchronous,
        // which means you have to access the `result` in the `success` function.
        success: async (result) => {
          const imageFile = new File([result], "shared-media", {type: "image/jpeg"});
          await uploadBytesResumable(imageRef, imageFile);
          
          resolve(imageFile);
          },
          
          error(error) {
            console.log(error.message);
            reject(error);
          }
        })
      });
  
      // Clean image state after uploading it.
      setImage(null);
      // return download url
      return await getDownloadURL(imageRef);
    } catch (err) {
      console.error(err);
    }
  }

  // We handle keydown to be able to send message with Enter.
  const handleKeyDown = async (event: any) => {
    if(event.code === "Enter" && !event.shiftKey) {
      // If enter is pressed and simultaneously shift is not pressed do the following:
      // (If shift was pressed it would just write a new line).
      const trimmedMessage = message.trim();
      // Trim the message first so there won't be any leading or ending whitespaces.
      if(trimmedMessage || image) {
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
        const imageDownloadUrl = image ? await handleImageUpload(image) : null;

        docData[curDate] = {
          senderId: currentUser?.uid,
          message: trimmedMessage ? trimmedMessage : null,
          img: imageDownloadUrl
        }
        // Update document.
        await updateDoc(docRef, docData);

        scrollIntoView();
      } else {
        // If message is just an empty string or a whitespace it does nothing, not even new line is written.
        event.preventDefault();
        setMessage(message + `\n`);
      }
    }
  }

  // Same thing goes here as in handleKeyDown, except here we just click on react-icon's icon.
  const handleClick = async () => {
    // trim message.
    const trimmedMessage = message.trim();
    // if message exists and it's not whitespace.
    if(trimmedMessage || image) {
      // clean message input field.
      setMessage("");
      // doc ref to which doc should be updated.
      const docRef = doc(firestore, "chats", combId);
      // date with which data is stored.
      const curDate = new Date().getTime();
      // create document reference as object.
      const docData: any = {};
      // create new field in docData with curDate's value and set it to an object with fields senderId, message.
      const imageDownloadUrl = image ? await handleImageUpload(image) : null;

      docData[curDate] = {
        senderId: currentUser?.uid,
        message: trimmedMessage ? trimmedMessage : null,
        img: imageDownloadUrl
      }
      // update document
      await updateDoc(docRef, docData);

      scrollIntoView();
    }

    setShowPicker(false);
  }

  const handleEmojiClick = () => {
    // emoji picker is shown based on showPicker
    setShowPicker(!showPicker);
    scrollIntoView();
  }

  useEffect(() => {
    const updateWritingStatus = async () => {
      // Current users userChats ref.
      const curUserChatsRef = doc(firestore, "chats", combId);

      try {
        if(message && !isWriting) {
          // If there is a message and writing state is set to false:
          setIsWriting(true);
          
          // Update current user writing status and set it to true.
          const updateChunk: any = {};
          updateChunk[`${currentUser?.uid}-isWriting`] = true;
          await updateDoc(curUserChatsRef, updateChunk);
          
        } else if(!message && isWriting) {
          // If there is not a message and writing state is set to true:
          setIsWriting(false);
  
          // Update current user writing status and set it to false.
          const updateChunk: any = {};
          updateChunk[`${currentUser?.uid}-isWriting`] = false;
          await updateDoc(curUserChatsRef, updateChunk);
        }
      } catch (err) {
        console.error(err);
      }
    }

    updateWritingStatus();
  }, [message]);

  if(props.user) {
    return (
      <>
        <div className="py-2 px-1 d-flex align-items-center justify-content-around gap-2">
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
            className="chat-box-input rounded w-75"
          />
          <div>
            <label className="chat-box-input-icon" htmlFor="imageForSend"><FaImage /></label>
            <input id="imageForSend" className="d-none" type="file" onChange={(e) => {
              const image = e.target.files ? e.target.files[0] : null;
              setImage(image);
            }} />
          </div>
          <div onClick={handleEmojiClick} className="chat-box-input-icon">
            <MdOutlineEmojiEmotions />
          </div>
          <div onClick={handleClick} className="chat-box-input-icon">
            <AiOutlineSend />
          </div>
        </div>
        {showPicker && <div className="picker-container"><Picker perLine={width > 574 ? "9" : "8"} previewPosition="none" onEmojiSelect={(event: any) => setMessage(message + event.native)} data={data} /> </div>}
      </>
    );
  }
}

export default ChatBoxInput;