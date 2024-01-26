import { createContext, useContext, useEffect, useState } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { firestore } from "../config/firebase";
import { sortObject } from "../functions/general";
import { AuthContext } from "./AuthContextProvider";

export const PostsContext = createContext<{
  postsData: {
    [key: string]: PostData
  },
  setPostsData: React.Dispatch<React.SetStateAction<{
    [key: string]: PostData;
  }>>
}>({
  postsData: {},
  setPostsData: () => {}
});

const PostsContextProvider = ({children}: any) => {
  const {currentUser} = useContext(AuthContext);
  const [postsData, setPostsData] = useState<{[key: string]: PostData}>({});

  useEffect(() => {
    const getPosts = async () => {
      let temporaryData: {[key: string]: PostData} = {};
      const postsQry = query(collection(firestore, "posts"));
      const postsSnapshot = await getDocs(postsQry);
      postsSnapshot.forEach(doc => {
        const data = doc.data() as PostData;
        const dateInUnix = new Date(data.date).getTime();
        temporaryData[dateInUnix] = data;
      });

      temporaryData = sortObject(temporaryData);

      setPostsData(temporaryData);
    }
    

    getPosts();

    return () => setPostsData({});
  }, [currentUser]);

  return <PostsContext.Provider value={{postsData, setPostsData}}>
    {children}
  </PostsContext.Provider>
}

export default PostsContextProvider;