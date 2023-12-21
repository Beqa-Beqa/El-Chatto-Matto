import { DocumentData } from "firebase/firestore";
import { ChatBoxInput, ChatBoxMessages, ChatBoxNavbar } from "..";
import { useState } from "react";

const MessagingWindow = (props: {
  user: DocumentData | null,
  setShowMessagingWindow: React.Dispatch<React.SetStateAction<boolean>>,
  classname?: string,
  styles?: any
}) => {

  // Reference states set in ChatBoxMessages and used in ChatBoxInput
  // message ref
  const [ref, setRef] = useState<React.RefObject<HTMLDivElement> | null>(null);
  // waiting dots ref
  const [dotsRef, setDotsRef] = useState<React.RefObject<HTMLDivElement> | null>(null);
  // message image ref
  const [imageRef, setImageRef] = useState<React.RefObject<HTMLImageElement> | null>(null);

  return (
    <div style={props.styles} className={`${props.classname} messaging-window d-flex flex-column`}>
      <ChatBoxNavbar setShowMessagingWindow={props.setShowMessagingWindow} user={props.user} />
      <ChatBoxMessages setImageRef={setImageRef} setDotsRef={setDotsRef} setRef={setRef} user={props.user} />
      <ChatBoxInput imageRef={imageRef} dotsRef={dotsRef} messageRef={ref} user={props.user} />
    </div>
  );
}

export default MessagingWindow;