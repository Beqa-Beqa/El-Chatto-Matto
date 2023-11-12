import { DocUser } from "../interfaces/UserInterfaces";

const ChatBoxMessages = (props: {
  user: DocUser | null
}) => {
  if(props.user) {
    return (
      // 80% of height | see main.scss
      <div className="messages bg-tertiary-6">

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