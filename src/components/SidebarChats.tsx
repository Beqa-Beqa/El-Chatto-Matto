import { useState } from "react";

const SidebarChats = () => {
  const [userName, setUserName] = useState<string>("");

  return (
    <div>
      <input className="w-100 bg-transparent border-none outline-none fs-1 p-1 text-tertiary" type="text" onChange={(e) => setUserName(e.target.value)} />
      <hr />
    </div>
  );
}

export default SidebarChats;