import { useContext, useState } from "react";
import { Post, WritePost } from "../..";
import { PostsContext } from "../../../contexts/PostsContextProvider";

const Content = () => {
  const {postsData, setPostsData} = useContext(PostsContext);
  const [extendedPost, setExtendedPost] = useState<string>("");

  return (
    <div  className="col-lg-7 col-md-11 col-12 ms-xl-5 pt-2 text-break position-relative px-2 px-md-0">
      <WritePost postsData={postsData} setPostsData={setPostsData} />
      <div className="loggedin-content-posts-wrapper w-100 rounded">
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