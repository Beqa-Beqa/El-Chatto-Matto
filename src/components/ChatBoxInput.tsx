import { DocUser } from "../interfaces/UserInterfaces"
import { useState } from "react";

const ChatBoxInput = (props: {
  user: DocUser | null
}) => {
  const [message, setMessage] = useState<string>("");

  if(props.user) {
    return (
      <div className="w-100 h-10 bg-tertiary text-primary">
        <input id="chat-box-input" type="text" className="border-none outline-none w-100 h-100 bg-transparent pl-1 fs-1" />
      </div>
    );
  }
}

export default ChatBoxInput;