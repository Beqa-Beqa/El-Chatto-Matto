import React, { useEffect } from "react";

export const useOutsideClick = (ref: React.MutableRefObject<any>, stateSetter: any, value: any) => {
  // Detect click outside of passed ref.
  useEffect(() => {
    // If clicked outside, run the following:
    const handleOutsideClick = (event: any) => {
      if(ref.current && !ref.current.contains(event.target)) {
        // State setters are passed to this hook, therefore we set that state
        // to the passed value.
        stateSetter(value);
      }
    }

    // Add event listener.
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      // Clean event listener.
      document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [ref]);
};