import { useState } from "react";

const SidebarChats = () => {
  const [userName, setUserName] = useState<string>("");

  return (
    <div className="bg-secondary">
      <input type="text" onChange={(e) => setUserName(e.target.value)} />
    </div>
  );
}

export default SidebarChats;