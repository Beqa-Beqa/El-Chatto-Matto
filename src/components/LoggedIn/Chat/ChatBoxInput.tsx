import { useState, useContext, useEffect } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { combineIds, getGlobalTimeUnix } from "../../../functions/general";
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
import { MessagesContext } from "../../../contexts/MessagesContextProvider";

const ChatBoxInput = (props: {
  user: DocumentData | null,
  messageRef: React.RefObject<HTMLDivElement> | null,
  dotsRef: React.RefObject<HTMLDivElement> | null,
  imageRef: React.RefObject<HTMLImageElement> | null,
  isInChat: boolean,
  currentUserPendingMessages: {
    text: string[];
    images: string[];
  },
  setCurrentUserPendingMessages: React.Dispatch<React.SetStateAction<{
    text: string[];
    images: string[];
  }>>
}) => {
  // Current user context to get info of currentuser.
  const {currentUser} = useContext(AuthContext);
  // window innerwidth.
  const {width} = useContext(GeneralContext);
  // isReadBy data.
  const {readByData} = useContext(MessagesContext);
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

  // Get sent messages from user which are about to be uploaded on firestore.
  const currentUserPendingMessages = props.currentUserPendingMessages;

  // Sending message logic.
  const sendMessage = async (trimmedMessage: string, image: File | null) => {
    const thisReadByData = readByData[`chatWith-${props.user!.uid}`];
    // if message exists and it's not whitespace.
    if(trimmedMessage || image) {
      // local download url for showing image in pending phase before it's sent to remote user.
      const localDownloadUrl = image && URL.createObjectURL(image);
      // Message cache object which will be set in localstorage, this will allow us to
      // display current user's sent messages before they are uploaded to firestore
      // hence - sending state. we have either text or images or both.
      const messageCache = Object.keys(currentUserPendingMessages).length ? {
        text: trimmedMessage && [...currentUserPendingMessages.text , trimmedMessage] || [...currentUserPendingMessages.text],
        images: localDownloadUrl && [...currentUserPendingMessages.images, localDownloadUrl] || [...currentUserPendingMessages.images]    
      } : {
        text: trimmedMessage && [trimmedMessage] || [],
        images: localDownloadUrl && [localDownloadUrl] || []
      }
      // Set messages cache with id of remote user.
      window.localStorage.setItem(`${props.user!.uid}`, JSON.stringify(messageCache));
      props.setCurrentUserPendingMessages(messageCache);
      // clean message input field.
      setMessage("");
      // doc ref to which doc should be updated.
      const docRef = doc(firestore, "chats", combId);
      // date with which data is stored.
      const curDate = await getGlobalTimeUnix();
      // temporary readby is object which holds readBy data for firestore.
      const temporaryReadBy: any = {};
      // if current user send's message this means it's read by current user.
      temporaryReadBy[currentUser!.uid] = true;
      // if remote user is in chat this means he has also read the message.
      temporaryReadBy[props.user!.uid] = props.isInChat;
      // set readBy as temporaryReadBy which stores info of users who read the message and who didn't.
      // unread messages count will increase if one of the user is not in chat (for current user's case it's remote user check).
      const docData: any = {isReadBy: {
        readBy: temporaryReadBy,
        unreadMessagesCount: props.isInChat ? 0
        : thisReadByData.unreadMessagesCount + 1 || 1
      }};
      try {
        // create new field in docData with curDate's value and set it to an object with fields senderId, message.
        const imageDownloadUrl = image ? await handleImageUpload(image) : null;

        docData[curDate] = {
          senderId: currentUser?.uid,
          message: trimmedMessage ? trimmedMessage : null,
          img: imageDownloadUrl
        }
        // update document
        await updateDoc(docRef, docData);

        window.localStorage.removeItem(`${props.user!.uid}`);
        props.setCurrentUserPendingMessages({images: [], text: []});
      } catch (err) {
        console.error(err);
      }

      scrollIntoView();
    }

    setShowPicker(false);
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
        try {
          sendMessage(trimmedMessage, image);
        } catch (err) {
          console.error(err);
        }
      } else {
        // If message is just an empty string or a whitespace it does nothing, not even new line is written.
        event.preventDefault();
        setMessage(message + `\n`);
      }
    }
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
          <div onClick={() => sendMessage(message.trim(), image)} className="chat-box-input-icon">
            <AiOutlineSend />
          </div>
        </div>
        {showPicker && 
          <div className="picker-container w-100">
            <Picker previewPosition="none"
              perLine={width > 768 ? "9" : width >= 725 && width <= 768 ? "19" : width >= 675 ? "17" : width >= 625 ? "16" : width >= 575 ? "15" : width >= 525 ? "14" : width >= 475 ? "13" : width >= 425 ? "11" : width >= 375 ? "10" : width > 345 ? "9" : "8"} 
              onEmojiSelect={(event: any) => setMessage(message + event.native)} 
              data={data} /> 
          </div>
        }
      </>
    );
  }
}

export default ChatBoxInput;