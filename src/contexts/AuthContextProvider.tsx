import { User, onAuthStateChanged } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth } from "../config/firebase"; 

// Create context so that all components will be able
// to reach currentuser value without need to pass
// props to all the components.

export const AuthContext = createContext<{
  // Type definitions
  currentUser: User | null,
  isLoading: boolean,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}>({
  // These are default values if none is given to provider
  currentUser: null,
  isLoading: true,
  setIsLoading: () => {}
});

const AuthContextProvider = ({children}: any) => {
  // States that represent context values
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Useffect checks if there is an user already signed in.
  // If yes then currentUser value updates to current user.
  // This check is needed due to short time data loss from database.
  // After that loading is set to off. When it's on, spinning circle is shown.

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if(!user) {
        setCurrentUser(null);
      } else {
        setCurrentUser(user);
      }
  
      setIsLoading(false);
    });
  // Cleaner
  return () => {
    unsubscribe();
  };
  }, []);

  return (
    // Provide context values to all the children elements 
    // that are wrapped with <ContextProvider> </ContextProvider> when exported.
    // Authcontext is the context defined above.
    // Other components will be able to use this context with
    // Importing `useContext` from react and `AuthContext` from here.
    // With the script {const variable = useContext(AuthContext)}.
    <AuthContext.Provider value={{currentUser, isLoading, setIsLoading}}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;