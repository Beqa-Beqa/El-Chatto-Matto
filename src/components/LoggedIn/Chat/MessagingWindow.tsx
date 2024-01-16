import { DocumentData, doc, updateDoc } from "firebase/firestore";
import { ChatBoxInput, ChatBoxMessages, ChatBoxNavbar } from "../..";
import { useContext, useEffect, useState } from "react";
import { firestore } from "../../../config/firebase";
import { AuthContext } from "../../../contexts/AuthContextProvider";
import { combineIds } from "../../../functions/general";
import { MessagesContext } from "../../../contexts/MessagesContextProvider";

const MessagingWindow = (props: {
  user: DocumentData | null,
  setShowMessagingWindow: React.Dispatch<React.SetStateAction<boolean>>,
  classname?: string,
  styles?: any
}) => {
  // all message data.
  const {allMessagesData, readByData} = useContext(MessagesContext);
  // message data relating to the current and chosen remote user.
  const thisReadBy = readByData[`chatWith-${props.user!.uid}`];
  // current user info.
  const {currentUser} = useContext(AuthContext);
  // Reference states set in ChatBoxMessages and used in ChatBoxInput
  // message ref
  const [ref, setRef] = useState<React.RefObject<HTMLDivElement> | null>(null);
  // waiting dots ref
  const [dotsRef, setDotsRef] = useState<React.RefObject<HTMLDivElement> | null>(null);
  // message image ref
  const [imageRef, setImageRef] = useState<React.RefObject<HTMLImageElement> | null>(null);
  
  // messages data that will be updated and messages in it will be displayed on screen.
  const [messages, setMessages] = useState<DocumentData>({});
  // state for checking if user writing status is active.
  const [userWrites, setUserWrites] = useState<boolean>(false);
  // state for checking if user is in chat or not.
  const [isInChat, setIsInChat] = useState<boolean>(false);

  // Combined ids for 2 users chat reference. (for 2 same user (user1, user2 and user2, user1) generated combined id will be the same
  // for we have only one object saved in docs with the combined value and not two for each of the user).
  const combIds = combineIds(currentUser?.uid!, props.user!.uid);
  // 2 users chat doc reference.
  const combDocRef = doc(firestore, "chats", combIds);


  useEffect(() => {
    if(props.user) {
      // user data with whom the chat is open.
      const data = allMessagesData![props.user.uid];
      // writing keys is an object containing 2 parameters, [current user id]-isWriting and
      // [remote user id]-isWriting which is boolean. for example: if it's set to true for current user,
      // 3 dots are shown in remote user's message box and vice versa.
      const writingKeys: any = {};
      // same thing goes here but it's -isInChat instead. based on this state we update information.
      const inChatKeys: any = {};

      // filtering messages so that writingKeys and inChatKeys are taken out of messages.
      const filteredMessages = Object.keys(data).reduce((obj: any, key) => {
        if(key.split("-")[1] === "isWriting") {
          writingKeys[key] = data[key];
        } else if (key.split("-")[1] === "isInChat") {
          inChatKeys[key] = data[key];
        } else if (key === "isReadBy") { 
          // pass
        } else {
          obj[key] = data[key];
        }
        return obj;
      }, {});

      // set messages state to filtered messages.
      setMessages(filteredMessages);

      // set states of writing keys and chat keys accordingly.
      writingKeys[`${props.user!.uid}-isWriting`] === true ? setUserWrites(true) : setUserWrites(false);
      inChatKeys[`${props.user!.uid}-isInChat`] === true ? setIsInChat(true) : setIsInChat(false);
    }
  }, [allMessagesData![props.user!.uid]]);

  // Useffect updates information in database. when user opens messaging window (component mount)
  // their isInChat property updates as true in respective chat document.
  // when they close the chat window or open another one (unmount) isInChat is set to false.
  useEffect(() => {
    // getIn action updates info as if user was in chat, getOut does vice versa.
    const chatAction = async (action: "getIn" | "getOut") => {
      if(action === "getIn") {
        const updateChunk: any = {} 
        const remoteDidRead = thisReadBy.readBy && thisReadBy.readBy[props.user!.uid] || false;
        const readByObj = {...thisReadBy.readBy};
        readByObj[currentUser!.uid] = true;
        readByObj[props.user!.uid] = isInChat;
        updateChunk.isReadBy = {
          readBy: readByObj,
          unreadMessagesCount: remoteDidRead ? 0 : thisReadBy.unreadMessagesCount || 0
        }
        updateChunk[`${currentUser?.uid}-isInChat`] = true;

        await updateDoc(combDocRef, updateChunk);
      } else {
        const updateChunk: any = {} 
        // When messaging window mounts this means user is in chat, therefore we update doc.
        updateChunk[`${currentUser?.uid}-isInChat`] = false;
        // update process.
        await updateDoc(combDocRef, updateChunk);
      }
    }

    // timeout is set because of multiple renders.
    const timeout = setTimeout(async () => await chatAction("getIn"), 200);

    return () => {
      // clear timeout on unmount.
      clearTimeout(timeout);
      // get out of chat action after unmount.
      chatAction("getOut");
    }
  }, [props.user]);

  return (
    <div style={props.styles} className={`${props.classname} messaging-window d-flex flex-column`}>
      <ChatBoxNavbar 
        setShowMessagingWindow={props.setShowMessagingWindow}
        user={props.user} 
        isInChat={isInChat} 
      />
      <ChatBoxMessages
        readBy={thisReadBy}
        setImageRef={setImageRef}
        setDotsRef={setDotsRef}
        setRef={setRef} 
        user={props.user} 
        messages={messages} 
        userWrites={userWrites}
      />
      <ChatBoxInput
        isInChat={isInChat}
        imageRef={imageRef} 
        dotsRef={dotsRef} 
        messageRef={ref} 
        user={props.user} 
      />
    </div>
  );
}

export default MessagingWindow;