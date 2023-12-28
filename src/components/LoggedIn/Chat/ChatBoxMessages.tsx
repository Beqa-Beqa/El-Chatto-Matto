import { AuthContext } from "../../../contexts/AuthContextProvider";
import { useContext, useEffect, useRef, useState} from "react";
import React from "react";
import { combineIds } from "../../../functions/general";
import { DocumentData, doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../config/firebase";
import { GeneralContext } from "../../../contexts/GeneralContextProvider";

const ChatBoxMessages = (props: {
  user: DocumentData | null,
  setRef: React.Dispatch<React.SetStateAction<React.RefObject<HTMLDivElement> | null>>,
  setDotsRef: React.Dispatch<React.SetStateAction<React.RefObject<HTMLDivElement> | null>>
  setImageRef: React.Dispatch<React.SetStateAction<React.RefObject<HTMLImageElement> | null>>
}) => {
  // currentuser context for current user info.
  const {currentUser} = useContext(AuthContext);
  // window innerwidth
  const {width} = useContext(GeneralContext);
  // messages data that will be updated and messages in it will be displayed on screen.
  const [messages, setMessages] = useState<DocumentData>({});
  // useref for sent or recieved div reference. used to scroll to newly sent or recieved message.
  const ref = useRef<HTMLDivElement>(null);
  const threeDotsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  // state for checking if user writing status is active.
  const [userWrites, setUserWrites] = useState<boolean>(false);

  // Messages length for scroll purposes (if messages length is 0 it will be false at the beginning,
  // if it will be more than 0 it will be true basically after rendering whole component.)
  const messagesLength = Object.keys(messages).length > 0;

  useEffect(() => {
    if(ref.current) {
      // If props.user is present and we have reference already, scroll to that ref.
      ref.current && ref.current.scrollIntoView();
    }
  }, [messagesLength])

  useEffect(() => {
    if(props.user) {
      // Combined ids for 2 users chat reference. (for 2 same user (user1, user2 and user2, user1) generated combined id will be the same
      // for that we have only one object saved in docs with the combined value and not two for each of the user).
      const combIds = combineIds(currentUser?.uid!, props.user.uid);
      // 2 users chat doc reference.
      const combDocRef = doc(firestore, "chats", combIds);
      // start listening to snapshots and update messages whenever message is sent from current user
      // or from remote user.
      const unsubMessagesListener = onSnapshot(combDocRef, (doc) => {
        const data = doc.data() || {};
        const writingKeys: any = {};

        const filteredMessages = Object.keys(data).reduce((obj: any, key) => {
          if(key.split("-")[1] !== "isWriting") {
            obj[key] = data[key];
          } else {
            writingKeys[key] = data[key];
          }
          return obj;
        }, {});

        setMessages(filteredMessages);

        writingKeys[`${props.user!.uid}-isWriting`] === true ? setUserWrites(true) : setUserWrites(false);
      });
      
      // Snapshot cleaner.
      return () => {
        unsubMessagesListener();
      };
    }
  }, [props.user]);

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

  // Render messages without swallowing shift + enter new lines.
  const renderMessage = (msg: string) => {
    return msg.split("\n").map((line: string, index: number) => {
      return <React.Fragment key={index}>
        {line}
        {index !== msg.split("\n").length - 1 && <br />}
      </React.Fragment>
    });
  }
  
  const messageBoxStyles = width > 574 ? {width: "100%", height: 418} : {width: "100%", height: "100%"};

  if(props.user) {
      // Conditional rendering for sent and recieved messages. Object.keys(messages) is an array of timestamps
      // these timestamps represent when the data was sent and are in unix format, therefore we are able to sort
      // them from highest to lowest value, which means the earliest message will be rendered first and latest will
      // render last. in documents we have objects with name of these timestamps (eg: (random timestamp) 1224915912951: {senderId: "id", message: "message"})
      // we check for senderid and if it's same as current user's id then we render it as sent, otherwise as recieved.
      // check the classnames of divs in conditional render.
      const messageElements = Object.keys(messages).sort((a: any, b: any) => a - b).map((doc: string, key:number) => {
        const incomingMessageFrom = messages[Object.keys(messages).sort((a: any, b: any) => a - b)[key + 1]] ? messages[Object.keys(messages).sort((a: any, b: any) => a - b)[key + 1]].senderId : undefined;

        return (
          // If sender's id is equal to current user's id.
          messages[doc].senderId === currentUser?.uid ?
          <div ref={ref} key={key} className="sent-message d-flex align-items-center justify-content-end">
            {incomingMessageFrom !== currentUser?.uid ?
              <div className="d-flex flex-column align-items-end justify-content-end">
                {messages[doc].message && <p style={{flexShrink: 0}} className="bg-primary px-2 py-1 mb-2 me-1 text-secondary">{renderMessage(messages[doc].message)}</p>}
                {messages[doc].img && <img ref={imageRef} style={{flexShrink: 0}} className="attachment-image rounded mb-2" src={messages[doc].img} alt="sent resource image" />}
              </div>
            :
              <div className="d-flex flex-column align-items-end justify-content-end">
                {messages[doc].message && <p style={{flexShrink: 0}} className="bg-primary px-2 py-1 mb-1 me-1 text-secondary">{renderMessage(messages[doc].message)}</p>}
                {messages[doc].img && <img ref={imageRef} style={{flexShrink: 0}} className="attachment-image rounded mb-1" src={messages[doc].img} alt="sent resource image" />}
              </div>
            }
          </div>
          :
          // If sender's id is equal to remote user's id.
          <div ref={ref} key={key} className="recieved-message d-flex align-items-center justify-content-start">
            {incomingMessageFrom !== props.user!.uid ?
              <div className="d-flex flex-column align-items-start justify-content-start">
                <div className="d-flex align-items-end">
                  <img style={{flexShrink: 0}} className="image mb-2" src={props.user!.photoURL} alt="icon" /> 
                  <div className="d-flex flex-column align-items-start">
                    {messages[doc].message && <p style={{flexShrink: 0}} className="bg-secondary px-2 py-1 mb-2 ms-2 text-primary">{renderMessage(messages[doc].message)}</p>}
                    {messages[doc].img && <img ref={imageRef} style={{flexShrink: 0}} className="attachment-image rounded mb-1 ms-2" src={messages[doc].img} alt="sent resource image" />}
                  </div>
                </div>
              </div>
            : 
              <div className="d-flex flex-column align-items-start justify-content-start">
                <div className="d-flex align-items-center">
                  {messages[doc].message && <div className="mb-0" style={{width: 35, height: 35, flexShrink: 0}} />}
                  {messages[doc].message && <p style={{flexShrink: 0}} className="bg-secondary px-2 py-1 mb-0 ms-2 text-primary">{renderMessage(messages[doc].message)}</p>}
                </div>
                <div className="d-flex align-items-center">
                  {messages[doc].img && <div className="mb-0" style={{width: 35, height: 35, flexShrink: 0}} />}
                  {messages[doc].img && <img ref={imageRef} style={{flexShrink: 0}} className="attachment-image rounded mb-0 ms-2" src={messages[doc].img} alt="sent resource image" />}
                </div>
              </div>
            }
          </div> 
        );
      });

      return (
        <div id="message-box" style={messageBoxStyles} className="messages-container p-2">
          {messageElements}
          {userWrites &&
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
      );

  } 
}

export default ChatBoxMessages;