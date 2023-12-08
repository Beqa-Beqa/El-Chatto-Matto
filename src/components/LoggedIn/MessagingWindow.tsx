import { DocumentData } from "firebase/firestore";
import { ChatBoxInput, ChatBoxMessages, ChatBoxNavbar } from "..";

const MessagingWindow = (props: {
  user: DocumentData | null,
  setShowMessagingWindow: React.Dispatch<React.SetStateAction<boolean>>,
  online: string[],
  classname?: string
  styles?: any
}) => {

  return (
    <div style={props.styles} className={`${props.classname} messaging-window d-flex flex-column`}>
      <ChatBoxNavbar setShowMessagingWindow={props.setShowMessagingWindow} user={props.user} online={props.online} />
      <ChatBoxMessages user={props.user} />
      <ChatBoxInput user={props.user} />
    </div>
  );
}

export default MessagingWindow;