import { createContext, useState, useEffect } from "react";

export const GeneralContext = createContext<{
  width: number,
  setWidth: React.Dispatch<React.SetStateAction<number>>
}>({
  width: window.innerWidth,
  setWidth: () => {}
});

const GeneralContextProvider = ({children}: any) => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <GeneralContext.Provider value={{width, setWidth}}>
      {children}
    </GeneralContext.Provider>
  );  
}

export default GeneralContextProvider;