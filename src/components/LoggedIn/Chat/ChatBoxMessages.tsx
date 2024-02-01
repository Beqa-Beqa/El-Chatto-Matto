import { AuthContext } from "../../../contexts/AuthContextProvider";
import { useContext, useEffect, useRef, useState } from "react";
import React from "react";
import { DocumentData } from "firebase/firestore";
import { GeneralContext } from "../../../contexts/GeneralContextProvider";
import { UserChatsContext } from "../../../contexts/UserChatsContextProvider";
import { MdDoneAll } from "react-icons/md";
import { IoCheckmarkDoneCircleSharp, IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { FaRegCircle } from "react-icons/fa";
import { BigImage } from "../..";
import { sortObject } from "../../../functions/general";

// Render messages without swallowing shift + enter new lines.
export const renderText = (msg: string) => {
    return msg.split("\n").map((line: string, index: number) => {
      return <React.Fragment key={index}>
        {line}
        {index !== msg.split("\n").length - 1 && <br />}
      </React.Fragment>
    });
  }

const ChatBoxMessages = (props: {
  user: DocumentData | null,
  setRef: React.Dispatch<React.SetStateAction<React.RefObject<HTMLDivElement> | null>>,
  setDotsRef: React.Dispatch<React.SetStateAction<React.RefObject<HTMLDivElement> | null>>
  setImageRef: React.Dispatch<React.SetStateAction<React.RefObject<HTMLImageElement> | null>>,
  messages: DocumentData,
  userWrites: boolean,
  readBy: {
    readBy: {
        [key: string]: boolean;
    };
    unreadMessagesCount: number;
  },
  currentUserPendingMessages: {
    text: string[];
    images: string[];
  },
  setCurrentUserPendingMessages: React.Dispatch<React.SetStateAction<{
    text: string[];
    images: string[];
  }>>
}) => {
  const messages = props.messages;

  // currentuser context for current user info.
  const {currentUser} = useContext(AuthContext);
  // window innerwidth
  const {width} = useContext(GeneralContext);
  // friends data of current user
  const {online, away} = useContext(UserChatsContext);

  // useref for sent or recieved div reference. used to scroll to newly sent or recieved message.
  const ref = useRef<HTMLDivElement>(null);
  const threeDotsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [showImage, setShowImage] = useState<{isOpen: boolean, imageSrc: string, type: string}>({isOpen: false, imageSrc: "", type: ""});
  const handleImageClick = (event: any) => {
    const imageSrc = (event.target as HTMLImageElement).src;
    setShowImage({isOpen: true, imageSrc, type: "message"});
  };

  // Messages length for scroll purposes (if messages length is 0 it will be false at the beginning,
  // if it will be more than 0 it will be true basically after rendering whole component.)
  const messagesLength = Object.keys(messages).length > 0;

  useEffect(() => {
    if(ref.current) {
      // If props.user is present and we have reference already, scroll to that ref.
      ref.current && ref.current.scrollIntoView();
    }
  }, [messagesLength])

  // useEffect decieds whether scroll towards new message or three dots or not.
  useEffect(() => {
    // If refs exists assign update props states.
    ref && props.setRef(ref);
    threeDotsRef && props.setDotsRef(threeDotsRef);
    imageRef && props.setImageRef(imageRef);

    // reference for waiting dots (incoming message)
    const waitingDots = document.getElementById("waiting-dots");
    // reference for messageBox (where messages are rendered).
    const messageBox = document.getElementById("message-box");

    // if both waiting dots and messagebox exist
    if(waitingDots && messageBox) {
      // if scroll is at the bottom, when waiting dots appear scroll towards them, otherwise do not scroll towards them.
      // padding and waiting dots` height goes up to 60px (approximate values, not exact)
      messageBox.scrollHeight - messageBox.scrollTop - 60 <= messageBox.clientHeight && threeDotsRef.current?.scrollIntoView();
    } else if (messageBox) {
      // paddings go up to 25px (approximate values, not exact)
      messageBox.scrollHeight - messageBox.scrollTop - 25 <= messageBox.clientHeight && ref.current?.scrollIntoView({behavior: "smooth"});
    }

  }, [threeDotsRef.current, ref.current, imageRef.current]);
  
  const messageBoxStyles = width > 574 ? {width: "100%", height: 418} : {width: "100%", height: "100%"};

  if(props.user) {
    const sortedMessages = sortObject(messages, false);
      // Conditional rendering for sent and recieved messages. Object.keys(messages) is an array of timestamps
      // these timestamps represent when the data was sent and are in unix format, therefore we are able to sort
      // them from highest to lowest value, which means the earliest message will be rendered first and latest will
      // render last. in documents we have objects with name of these timestamps (eg: (random timestamp) 1224915912951: {senderId: "id", message: "message" or "null", img: "downloadurl" or "null"})
      // we check for senderid and if it's same as current user's id then we render it as sent, otherwise as recieved.
      // check the classnames of divs in conditional render.
      const messageElements = Object.keys(sortedMessages).map((doc: string, key:number) => {
        const orderKey = parseInt(Object.keys(sortedMessages)[key]);
        const incomingMessageFrom = messages[Object.keys(sortedMessages)[key + 1]] ? messages[Object.keys(sortedMessages)[key + 1]].senderId : undefined;
        // Has time distinction is time range from previous message to current message.
        // if previous does not exist it will be set to "No Time", otherwise it will be false.
        // if has time distinction is more than 6000 (it's in miliseconds (10min)) then we want
        // to visually show difference in chat. 
        const hasTimeDistinction: number | string | boolean = messages[Object.keys(sortedMessages)[key - 1]] ?
        parseInt(Object.keys(sortedMessages)[key]) - parseInt(Object.keys(sortedMessages)[key - 1]) :
        !messages[Object.keys(sortedMessages)[key - 1]] ? "No Time" : false;

        // Current time when message was sent. (used when hasTimeDistinction is set as "No Time")
        const sendingTime = new Date(parseInt(Object.keys(sortedMessages)[key]));

        const timeDistinctionElement = hasTimeDistinction === "No Time" ? 
          <div>
            <span style={{fontSize: 14}} className="text-primary d-block text-center mb-3">{sendingTime.toLocaleString()}</span>
          </div>
        : typeof hasTimeDistinction === "number" && hasTimeDistinction >= 600000 ?
          <div>
            <span style={{fontSize: 14}} className="text-primary d-block text-center mt-3 mb-3">{sendingTime.toLocaleString()}</span>
          </div>
        : typeof hasTimeDistinction === "number" && hasTimeDistinction >= 120000 ?
          <div style={{height: 10}} />
        : null;

        return (
          // If sender's id is equal to current user's id.
          messages[doc].senderId === currentUser?.uid ?
          <React.Fragment key={orderKey}>
            {timeDistinctionElement}
            <div ref={ref} className="sent-message d-flex align-items-center justify-content-end">
              {incomingMessageFrom !== currentUser?.uid ?
                <div className="d-flex flex-column align-items-end justify-content-end">
                  {messages[doc].message && <p style={{flexShrink: 0}} className="bg-primary px-2 py-1 mb-2 me-1 text-secondary">{renderText(messages[doc].message)}</p>}
                  {messages[doc].img && <img onClick={handleImageClick} ref={imageRef} style={{flexShrink: 0}} className="cursor-pointer attachment-image rounded mb-2" src={messages[doc].img} alt="sent resource image" />}
                </div>
              :
                <div className="d-flex flex-column align-items-end justify-content-end">
                  {messages[doc].message && <p style={{flexShrink: 0}} className="bg-primary px-2 py-1 mb-1 me-1 text-secondary">{renderText(messages[doc].message)}</p>}
                  {messages[doc].img && <img onClick={handleImageClick} ref={imageRef} style={{flexShrink: 0}} className="cursor-pointer attachment-image rounded mb-1" src={messages[doc].img} alt="sent resource image" />}
                </div>
              }
            </div>
          </React.Fragment>
          :
          // If sender's id is equal to remote user's id.
          <React.Fragment key={orderKey}>
            {timeDistinctionElement}
            <div ref={ref} className="recieved-message d-flex align-items-center justify-content-start">
              {incomingMessageFrom !== props.user!.uid ?
                <div className="d-flex flex-column align-items-start justify-content-start">
                  <div className="d-flex align-items-end">
                    <img style={{flexShrink: 0}} className="image mb-2" src={props.user!.photoURL} alt="icon" /> 
                    <div className="d-flex flex-column align-items-start">
                      {messages[doc].message && <p style={{flexShrink: 0}} className="bg-secondary px-2 py-1 mb-2 ms-2 text-primary">{renderText(messages[doc].message)}</p>}
                      {messages[doc].img && <img onClick={handleImageClick} ref={imageRef} style={{flexShrink: 0}} className="cursor-pointer attachment-image rounded mb-1 ms-2" src={messages[doc].img} alt="sent resource image" />}
                    </div>
                  </div>
                </div>
              : 
                <div className="d-flex flex-column align-items-start justify-content-start">
                  <div className="d-flex align-items-center">
                    {messages[doc].message && <div className="mb-0" style={{width: 35, height: 35, flexShrink: 0}} />}
                    {messages[doc].message && <p style={{flexShrink: 0}} className="bg-secondary px-2 py-1 mb-1 ms-2 text-primary">{renderText(messages[doc].message)}</p>}
                  </div>
                  <div className="d-flex align-items-center">
                    {messages[doc].img && <div className="mb-0" style={{width: 35, height: 35, flexShrink: 0}} />}
                    {messages[doc].img && <img onClick={handleImageClick} ref={imageRef} style={{flexShrink: 0}} className="cursor-pointer attachment-image rounded mb-0 ms-2" src={messages[doc].img} alt="sent resource image" />}
                  </div>
                </div>
              }
            </div>
          </React.Fragment>
        );
      });

      const messagesLength = Object.keys(messages).length;
      const lastMessageKey = Math.max(...Object.keys(messages).map((key: string) => parseInt(key)), 0);
      // Get sent messages from user which are about to be uploaded on firestore.
      const currentUserPendingMessages = props.currentUserPendingMessages;

      return (
        <>
          <div id="message-box" style={messageBoxStyles} className="messages-container pt-2 ps-2 pe-2">
            {messageElements}
            <div className="d-flex justify-content-end">
              <small style={{top: -8}} className="text-primary me-2 position-relative">
                { messagesLength && messages[lastMessageKey].senderId !== props.user.uid ?
                    props.readBy.unreadMessagesCount > 0 ?
                      online.includes(props.user.uid) || away.includes(props.user.uid) ?
                        <>
                          <span>Recieved</span> <IoCheckmarkDoneCircleSharp />
                        </>
                      : 
                        <>
                          <span>Sent</span> <IoCheckmarkDoneCircleOutline />
                        </> 
                    :
                      <>
                        <span>Seen</span> <MdDoneAll />
                      </>
                  : null
                }
              </small>
            </div>
            {Object.keys(currentUserPendingMessages).length ?
              <div ref={ref} className="sent-message d-flex align-items-center justify-content-end">
                <div className="d-flex flex-column align-items-end justify-content-end">
                  {currentUserPendingMessages.text.map((text: string, key: number) => {
                    return <React.Fragment key={key}> 
                      <p style={{flexShrink: 0}} className="bg-primary px-2 py-1 mb-0 mt-1 me-1 text-secondary">
                        {renderText(text)}
                      </p>
                      <small className="text-primary">
                        <span>Sending</span> <FaRegCircle />
                      </small>
                    </React.Fragment>
                  })}
                  {currentUserPendingMessages.images.map((image: string) => {
                    return <>
                      <img ref={imageRef} style={{flexShrink: 0}} className="attachment-image rounded mb-2" src={image} alt="sent resource image" />
                        <small className="text-primary">
                          <span>Sending</span> <FaRegCircle />
                        </small>
                    </>
                  })}
                </div>
              </div>
              : null
            }
            {props.userWrites &&
              <div ref={threeDotsRef} id="waiting-dots" className="d-flex align-items-center justify-content-start">
                <img className="image" src={props.user!.photoURL} alt="icon" />
                <div id="wave">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div> 
            }
          </div>
          {showImage.isOpen && 
            <BigImage 
              isImageOpen={{imageSrc: showImage.imageSrc, type: showImage.type}} 
              setIsImageOpen={setShowImage} 
              options={{hasDownload: true}}
            />}
        </>
      );
  } 
}

export default ChatBoxMessages;