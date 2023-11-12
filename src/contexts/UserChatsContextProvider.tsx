import { createContext, useState } from "react";

// Create context, give type and default values.
export const UserChatsContext = createContext<{
  chats: boolean,
  updateChats: React.Dispatch<React.SetStateAction<boolean>>
}>({
  chats: false,
  updateChats: () => {}
});

// Provider function.
const UserChatsContextProvider = ({children}: any) => {
  // State that we use in other components.
  const [chats, updateChats] = useState<boolean>(false);

  // Provider wrapper.
  return (
    <UserChatsContext.Provider value={{chats, updateChats}}>
      {children}
    </UserChatsContext.Provider>
  );
}

export default UserChatsContextProvider;