import { useContext, useState } from "react";
import { Post, WritePost } from "../..";
import { PostsContext } from "../../../contexts/PostsContextProvider";
import { renderText } from "../Chat/ChatBoxMessages";

const Content = () => {
  const {postsData, setPostsData} = useContext(PostsContext);
  const [extendedPost, setExtendedPost] = useState<string>("");

  const [postsCache, setPostCache] = useState(JSON.parse(window.localStorage.getItem("posts") || "{}"));

  return (
    <div  className="col-lg-7 col-md-11 col-12 ms-xl-5 pt-2 text-break position-relative px-2 px-md-0">
      <WritePost setPostCache={setPostCache} postsData={postsData} setPostsData={setPostsData} />
      <div className="loggedin-content-posts-wrapper w-100 rounded">
        {Object.keys(postsCache).length ?
          Object.keys(postsCache).sort().map((postKey: string, key: number) => {
            const post = postsCache[postKey];

            return <>
              {<span className="text-muted">Posting...</span>}
              <div className="opacity-75 bg-primary p-2 rounded mb-3" key={key}>
                <div className="d-flex align-items-center gap-2">
                  <img className="image" src={post.photoURL} alt="user"/>
                  <div className="post-text d-flex flex-md-row flex-column align-items-md-center gap-md-4">
                    <span className="fs-5">{post.displayName}</span>
                    <small className="opacity-50">{post.date}</small>
                  </div>
                </div>
                <div className="d-inline post-text">
                  {post.text && <p className={post.text.length <= 50 ? "mb-0 fs-4" : "mb-0"}>{renderText(post.text)}</p>}
                </div>
                {post.media ?
                  post.media.type === "image" ?
                    <>
                      <hr className="mb-1 mt-1"/>
                      <img className="w-100 rounded object-fit-cover cursor-pointer" style={{maxHeight: 350}} src={post.media.url!} alt="user post image" />
                    </>
                  : post.media.type === "video" ?
                    <div className="w-100">
                      <hr className="mb-1 mt-1"/>
                      <video autoPlay muted style={{maxHeight: 450}} className="w-100 rounded object-fit-cover">
                        <source className="w-100" src={post.media.url!} type="video/mp4" />
                      </video>
                    </div>
                  : null
                : null
                }
              </div>
            </>
          })
        : null
        }
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