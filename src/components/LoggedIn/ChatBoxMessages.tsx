import { AuthContext } from "../../contexts/AuthContextProvider";
import { useContext, useEffect, useRef, useState} from "react";
import React from "react";
import { combineIds } from "../../functions";
import { DocumentData, doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../config/firebase";
import { GeneralContext } from "../../contexts/GeneralContextProvider";

const ChatBoxMessages = (props: {
  user: DocumentData | null
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
  // state for checking if user writing status is active.
  const [userWrites, setUserWrites] = useState<boolean>(false);

  // Whenever user or messages change useffect will be triggered.
  useEffect(() => {
    if(props.user) {
      // If props.user is present and we have reference already, scroll to that ref.
      ref.current && ref.current.scrollIntoView();
    }

    const messageBox = document.getElementById("message-box");

    messageBox &&
      messageBox.scrollHeight - messageBox.scrollTop <= messageBox.clientHeight + 52 && ref.current?.scrollIntoView();

  }, [messages]);

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
        setMessages(doc.data()!);
      });

      // snapshot listener for writing status.
      // remote user's doc ref.
      const targetUserDocRef = doc(firestore, "userChats", props.user.uid);
      // If whether isWriting status is set to true or false on remote user's docs, update userWrites state accordingly.
      const unsubWritingStatusListener = onSnapshot(targetUserDocRef, (userDoc: DocumentData) => {
        userDoc.data().isWriting ? setUserWrites(true) : setUserWrites(false);
      });
      
      // Snapshot cleaner.
      return () => {
        unsubMessagesListener();
        unsubWritingStatusListener();
      };
    }
  }, [props.user]);

  // Render messages without swallowing shift + enter new lines.
  const renderMessage = (msg: string) => {
    return msg.split("\n").map((line: string, index: number) => {
      return <React.Fragment key={index}>
        {line}
        {index !== msg.split("\n").length - 1 && <br />}
      </React.Fragment>
    });
  }

  const styles = width > 574 ? {height: 320} : {height: "100%"};

  if(props.user) {
      // Conditional rendering for sent and recieved messages. Object.keys(messages) is an array of timestamps
      // these timestamps represent when the data was sent and are in unix format, therefore we are able to sort
      // them from highest to lowest value, which means the earliest message will be rendered first and latest will
      // render last. in documents we have objects with name of these timestamps (eg: (random timestamp) 1224915912951: {senderId: "id", message: "message"})
      // we check for senderid and if it's same as current user's id then we render it as sent, otherwise as recieved.
      // check the classnames of divs in conditional render.
      const messageElements = Object.keys(messages).sort((a: any, b: any) => a - b).map((doc: string, key:number) => {
        return (
          // If sender's id is equal to current user's id.
          messages[doc].senderId === currentUser?.uid ?
          <div ref={ref} key={key} className="sent-message d-flex align-items-center mb-2 justify-content-end">
            <p className="bg-primary px-2 pb-1 mb-0 me-1 text-secondary">{renderMessage(messages[doc].message)}</p>
            <img className="image" src={currentUser?.photoURL!} alt="icon" />
          </div>
        :
          // If sender's id is equal to remote user's id.
          <div ref={ref} key={key} className="recieved-message d-flex align-items-center mb-2 justify-content-start">
            <img className="image" src={props.user!.photoURL} alt="icon" />
            <p className="bg-secondary px-2 pb-1 mb-0 ms-1 text-primary">{renderMessage(messages[doc].message)}</p>
          </div> 
        );
      });

      return (
        <div ref={threeDotsRef} id="message-box" style={styles} className="messages-container p-2">
          {messageElements}
          {userWrites &&
            <div id="waiting-dots" className="d-flex align-items-center justify-content-start">
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