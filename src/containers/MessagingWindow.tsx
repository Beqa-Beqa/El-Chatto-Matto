import { SidebarChats, SidebarNavbar } from "../components";

const MessagingWindow = () => {
  return (
    <div id="messaging-window" className="d-flex bg-secondary-6">
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