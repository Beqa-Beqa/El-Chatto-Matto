import { useContext, useEffect, useState } from "react";
import { GeneralContext } from "../../../contexts/GeneralContextProvider";
import { collection, getDocs, query } from "firebase/firestore";
import { firestore } from "../../../config/firebase";
import { Post, WritePost } from "../..";
import { sortObject } from "../../../functions/general";

const Content = () => {
  // innerWidth of window.
  const {width} = useContext(GeneralContext);

  // Dynamic content styles based on width.
  const contentStyles = width >= 1024 ? {maxWidth: 640} : width > 576 ? {maxWidth: 640, margin: "0 auto"} : {width: "100%"};

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
  }, []);

  const [extendedPost, setExtendedPost] = useState<string>("");

  return (
    <div style={contentStyles} className="loggedin-content w-100 ms-xl-5 pt-2 text-break position-relative ps-2 ps-lg-0 pe-lg-0 ps-md-0 pe-5">
      <WritePost postsData={postsData} setPostsData={setPostsData} />
      <div className="loggedin-content-posts-wrapper w-100 ps-lg-0 pe-lg-0 pe-2 ms-lg-5 rounded">
          {Object.keys(postsData).length ?
              Object.keys(postsData).map((postKey: string, key: number) => {
                return <Post 
                  postsData={postsData} 
                  setPostsData={setPostsData} 
                  extendedPost={extendedPost}
                  setExtendedPost={setExtendedPost}
                  postKey={postKey}
                  key={key}
                />
              })
            : null
          }
      </div>
    </div>
  );
}

export default Content;