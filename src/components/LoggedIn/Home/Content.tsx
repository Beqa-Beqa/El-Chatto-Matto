import React, { useContext, useEffect, useState } from "react";
import { GeneralContext } from "../../../contexts/GeneralContextProvider";
import { AuthContext } from "../../../contexts/AuthContextProvider";
import { useNavigate } from "react-router-dom";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";
import { FaImage, FaPhotoVideo } from "react-icons/fa";
import { collection, doc, getDocs, query, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../config/firebase";
import uuid from "react-uuid";
import { UserChatsContext } from "../../../contexts/UserChatsContextProvider";
import { findAllInstances } from "../../../functions/general";

const Content = () => {
  // innerWidth of window.
  const {width} = useContext(GeneralContext);
  // Information about current user.
  const {currentUser} = useContext(AuthContext);
  // trigger for refetching data.
  const {setTrigger} = useContext(RemoteUserContext);
  // info about users posts count
  const {postsCount} = useContext(UserChatsContext);

  // state for showing post prompt.
  const [postPromptVisible, setPostPromptVisible] = useState<boolean>(false);
  // state for storing post input value.
  const [postInputValue, setPostInputValue] = useState<string>("");

  // navigate for navigating through urls.
  const navigate = useNavigate();

  // Dynamic content styles based on width.
  const contentStyles = width >= 1024 ? {maxWidth: 650} : width > 576 ? {maxWidth: 650, margin: "0 auto"} : {width: "100%"};
  
  // Render posts without swallowing shift + enter new lines.
  const renderPost = (post: string) => {
    return post.split("\n").map((line: string, index: number) => {
      return <React.Fragment key={index}>
        {line}
        {index !== post.split("\n").length - 1 && <br />}
      </React.Fragment>
    });
  }

  const [postsData, setPostData] = useState<PostData[]>([]);
  
  useEffect(() => {
    const temporaryData: PostData[] = [];

    const getPosts = async () => {
      const postsQry = query(collection(firestore, "posts"));
      const postsSnapshot = await getDocs(postsQry);
      postsSnapshot.forEach(doc => temporaryData.push(doc.data() as PostData));

      setPostData(temporaryData);
    }

    getPosts();

    return () => setPostData([]);
  }, [])

  const [extendedPost, setExtendedPost] = useState<string>("");

  return (
    <>
      <div style={contentStyles} className="loggedin-content w-100 ms-xl-5 pt-2 text-break position-relative ps-2 ps-lg-0 pe-lg-0 ps-md-0 pe-5">
        <div className="w-100 ps-lg-0 pe-lg-0 pe-2 ms-lg-5 rounded mb-3">
          <div className="p-2 bg-primary rounded d-flex flex-column">
            <div className="d-flex align-items-center">
              <img onClick={() => {navigate(`/${currentUser?.uid}`); setTrigger(prev => !prev)}} role="button" className="image me-2" src={currentUser?.photoURL!} alt="your image" />
              <button onClick={() => setPostPromptVisible(true)} className="post-input-button">
                Hello {currentUser?.displayName?.split(" ")[0]}, Would you like to share your thoughts ?
              </button>
            </div>
            <div className="d-flex mt-3">
              <div className="post-button w-100 py-1 rounded d-flex justify-content-center gap-1">
                <div className="d-flex align-items-center">
                  <FaImage className="post-button-icon text-secondary" />
                  <span className="ms-2 text-secondary">Image</span>
                </div>
                /
                <div className="d-flex align-items-center">
                  <FaPhotoVideo className="post-button-icon text-secondary" /> 
                  <span className="ms-2 text-secondary">Video</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="loggedin-content-posts-wrapper w-100 ps-lg-0 pe-lg-0 pe-2 ms-lg-5 rounded">
            {postsData.length ?
                postsData.map((post: PostData, key: number) => {
                  // needs extension is boolean for controlling if extending three dots is needed for post or not.
                  const newLines = findAllInstances(post.text, "\n")
                  const needsExtension = {
                    needs: post.text.length > 300 || newLines.length > 5,
                    why: post.text.length > 300 ? "length" : newLines.length > 5 ? "newlines" : false
                  }

                  return (
                    <div key={key} className="loggedin-content-post p-2 bg-primary rounded mb-3">
                      <div>
                        <div className="post-owner-info d-flex align-items-center gap-2 mb-2">
                          <img onClick={() => {navigate(`${post.by}`); setTrigger(prev => !prev)}} className="image cursor-pointer" src={post.photoURL} alt="user image" />
                          <div className="d-flex flex-md-row flex-column align-items-md-center gap-md-4">
                            <span className="fs-5">{post.displayName}</span>
                            <small className="text-secondary opacity-50">Date: {post.date}</small>
                          </div>
                        </div>
                        <p className={post.text.length <= 50 ? "mb-0 fs-4" : "mb-0"}>
                          {
                            extendedPost === post.postId ?
                              renderPost(post.text)
                            : 
                              needsExtension.needs ?
                                renderPost(
                                  needsExtension.why === "length" ? 
                                    post.text.substring(0, 150) 
                                  : 
                                    post.text.substring(0, newLines[0])
                                ) 
                              : renderPost(post.text)
                          }
                        </p>
                      </div>
                      {
                        needsExtension.needs && <small onClick={() => {
                            extendedPost === post.postId ? setExtendedPost("") : setExtendedPost(post.postId);
                          }} role="button" className="extension w-100 d-flex justify-content-end">
                          {extendedPost !== post.postId ? "... See More" : "Show Less"}
                        </small>
                      }
                    </div>
                  );
                })
              : null
            }
        </div>
      </div>
      {postPromptVisible && <div className="user-prompt">
        <div className="bg-secondary rounded py-2 px-1 col-md-6 col-sm-11 col-12">
          <textarea
            autoFocus
            onChange={(e) => setPostInputValue(e.target.value)}
            value={postInputValue}
            className="textarea-for-post w-100"
            placeholder={`Hello ${currentUser?.displayName?.split(" ")[0]}, Would you like to share your thoughts ?`}
          />
          <small onClick={() => setPostInputValue("")} role="button" className="text-primary text-decoration-underline">clear</small>
          <div className="mt-2 d-flex justify-content-center gap-3">
            <button onClick={async () => {
              if(postInputValue.trim()) {
                const uid: string = uuid();
                const postRef = doc(firestore, "posts", uid);
                const currentUserChatsRef = doc(firestore, "userChats", currentUser!.uid);
                const currentDate = new Date().toLocaleString();
                setPostPromptVisible(false);
                setPostInputValue("");
                await setDoc(postRef, {
                  text: postInputValue, 
                  by: currentUser?.uid, 
                  date: currentDate,
                  photoURL: currentUser?.photoURL,
                  displayName: currentUser?.displayName,
                  postId: uid
                });
                await updateDoc(currentUserChatsRef, {
                  postsCount: postsCount + 1
                })
              }
            }} style={{width: 80}} disabled={!postInputValue.trim()} className="action-button rounded">
              Post
            </button>
            <button style={{width: 80}} onClick={() => setPostPromptVisible(false)} className="action-button rounded">
              Cancel
            </button>
          </div>
        </div>
      </div>
      }
    </>
  );
}

export default Content;