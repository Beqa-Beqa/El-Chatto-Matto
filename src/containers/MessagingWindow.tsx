import { SidebarChats, SidebarNavbar } from "../components";

const MessagingWindow = () => {
  return (
    <div id="messaging-window" className="d-flex">
      <div className="side-bar">
        <SidebarNavbar />
        <SidebarChats />
      </div>
      <div className="chat-box">

      </div>
    </div>
  );
}

export default MessagingWindow;