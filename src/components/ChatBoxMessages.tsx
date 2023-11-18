import { AuthContext } from "../contexts/AuthContextProvider";
import { useContext, useEffect, useRef, useState } from "react";
import { combineIds } from "../functions";
import { DocumentData, doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../config/firebase";

const ChatBoxMessages = (props: {
  user: DocumentData | null
}) => {
  // currentuser context for current user info.
  const {currentUser} = useContext(AuthContext);
  // messages data that will be updated and messages in it will be displayed on screen.
  const [messages, setMessages] = useState<DocumentData>({});
  // useref for sent or recieved div reference. used to scroll to newly sent or recieved message.
  const ref = useRef<HTMLDivElement>(null);

  // Whenever user or messages change useffect will be triggered.
  useEffect(() => {
    if(props.user) {
      // If props.user is present and we have reference already, scroll to that ref.
      ref.current && ref.current.scrollIntoView();
    }
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
      const unsub = onSnapshot(combDocRef, (doc) => {
        setMessages(doc.data()!);
      });

      // Snapshot cleaner.
      return () => unsub();
    }
  }, [props.user]);

  if(props.user) {
      // 80% of height | see main.scss
      // Conditional rendering for sent and recieved messages. Object.keys(messages) is an array of timestamps
      // these timestamps represent when the data was sent and are in unix format, therefore we are able to sort
      // them from lowest to highest value, which means the earliest message will be rendered first and latest will
      // render last. in documents we have objects with name of these timestamps (eg: (random timestamp) 1224915912951: {senderId: "id", message: "message"})
      // we check for senderid and if it's same as current user's id then we render it as sent othervies as recieved.
      // check the classnames of divs in conditional render.
      const messageElements = Object.keys(messages).sort((a: any, b: any) => a - b).map((doc: string, key:number) => {
        return (
          messages[doc].senderId === currentUser?.uid ?
          <div ref={ref} key={key} className="sent d-flex align-center mb-1 justify-end">
            <p>{messages[doc].message}</p>
            <img className="image" src={currentUser?.photoURL!} alt="icon" />
          </div>
        :
          <div ref={ref} key={key} className="recieved d-flex align-center mb-1 justify-start">
            <img className="image" src={props.user!.photoURL} alt="icon" />
            <p>{messages[doc].message}</p>
          </div> 
        );
      });

      return (
        <div className="messages bg-tertiary-6 pt-1 pl-1 pr-1 d-flex flex-column">
          {messageElements}
        </div>
      );

  } else {
    return (
      <div className="h-100 bg-tertiary-6 d-flex align-center">
        <p className="fs-2 text-primary ml-2">Find or choose an user to start chatting.</p>
      </div>
    );
  }
}

export default ChatBoxMessages;