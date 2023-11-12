import { useState } from "react";
import { SidebarSearch, SidebarNavbar, SidebarChats, ChatBoxNavbar, ChatBoxMessages, ChatBoxInput } from "../components";
import { DocUser } from "../interfaces/UserInterfaces";

  const MessagingWindow = () => {
    const [user, setUser] = useState<DocUser | null>(null);

    return (
      <div id="messaging-window" className="d-flex bg-secondary-6">
        <div className="side-bar">
          <SidebarNavbar />
          <SidebarSearch />
          <SidebarChats setUser={setUser} />
        </div>
        <div className="chat-box">
          <ChatBoxNavbar user={user} />
          <ChatBoxMessages user={user} />
          <ChatBoxInput user={user} />
        </div>
      </div>
    );
  }

export default MessagingWindow;