import React, { useContext, useState } from "react";
import { findAllInstances } from "../../../../functions/general";
import { AuthContext } from "../../../../contexts/AuthContextProvider";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaRegCommentDots } from "react-icons/fa6";
import { NavDropdown } from "react-bootstrap";
import { FaThumbsUp } from "react-icons/fa"
import { useNavigate } from "react-router-dom";
import { RemoteUserContext } from "../../../../contexts/RemoteUserContextProvider";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { firestore, storage } from "../../../../config/firebase";
import { UserChatsContext } from "../../../../contexts/UserChatsContextProvider";
import { deleteObject, ref } from "firebase/storage";
import { BigImage } from "../../..";

const Post = (props: {
  postKey: string, 
  postsData: {[key: string]: PostData},
  setPostsData: React.Dispatch<React.SetStateAction<{
    [key: string]: PostData;
  }>>,
  extendedPost: string,
  setExtendedPost: React.Dispatch<React.SetStateAction<string>>
}) => {

  const {currentUser} = useContext(AuthContext);
  const {setTrigger} = useContext(RemoteUserContext);
  // info about users posts count
  const {postsCount} = useContext(UserChatsContext);

  const post: PostData = props.postsData[props.postKey];

  // needs extension is boolean for controlling if extending three dots is needed for post or not.
  const newLines = post.text && findAllInstances(post.text, "\n") || [];
  const needsExtension = {
    needs: post.text ? post.text.length > 300 || newLines.length > 5 : false,
    why: post.text ? post.text.length > 300 ? "length" : newLines.length > 5 ? "newlines" : "" : false
  }

  // state for showing post prompt.
  const [postPromptVisible, setPostPromptVisible] = useState<boolean>(false);
  // state for storing post input value.
  const [postInputValue, setPostInputValue] = useState<string>(post.text ? post.text : "");

  const [showPostImage, setShowPostImage] = useState<{isOpen: boolean, imageSrc: string, type: string}>({isOpen: false, imageSrc: "", type: ""});

  // navigate for navigating through urls.
  const navigate = useNavigate();

  // Render posts without swallowing shift + enter new lines.
  const renderPost = (post: string) => {
    return post.split("\n").map((line: string, index: number) => {
      return <React.Fragment key={index}>
        {line}
        {index !== post.split("\n").length - 1 && <br />}
      </React.Fragment>
    });
  }

  const handleLike = async (post: PostData) => {
    const currentDate = new Date().toLocaleString();
    const postKey = new Date(post.date).getTime();
    const newPostsData: {[key: string]: PostData} = {...props.postsData};
    let updateChunk: any = {};
    if(post.likes && (currentUser!.uid in post.likes)) {
      updateChunk = {...post.likes};
      delete updateChunk[currentUser!.uid];
      delete newPostsData[postKey].likes![currentUser!.uid];
      props.setPostsData(newPostsData);
    } else {
      const data = {
        date: currentDate,
        displayName: currentUser?.displayName!,
        photoURL: currentUser?.photoURL!
      }
      updateChunk = {...post.likes, [currentUser!.uid]: data};

      newPostsData[postKey].likes! = updateChunk;
      props.setPostsData(newPostsData);
    }
    try {
      await updateDoc(doc(firestore, "posts", post.postId), {likes: updateChunk});
    } catch (err) {
      console.error(err);
    }
  }

  const handlePostDelete = async (post: PostData, postKey?: string) => {
    try {
      post.media.ref && await deleteObject(ref(storage, post.media.ref));
      await deleteDoc(doc(firestore, "posts", post.postId));
      await updateDoc(doc(firestore, "userChats", currentUser!.uid), {
        postsCount: postsCount - 1
      });
      const newPostsData = {...props.postsData};
      postKey && delete newPostsData[postKey];
      props.setPostsData(newPostsData);
    } catch (err) {
      console.error(err);
    }
  }

  const handlePostEdit = async (post: PostData, postKey: string) => {
    try {

      const postDocRef = doc(firestore, "posts", post.postId);
      await updateDoc(postDocRef, {
        text: postInputValue
      });
      
      let newPostsData = {...props.postsData};
      newPostsData[postKey].text = postInputValue;
      props.setPostsData(newPostsData);
    } catch (err) {
      console.error(err);
    }
  }

  const isPostLiked = post.likes ? currentUser!.uid in post.likes : false;
  const likesQuantity = Object.keys(post.likes as Object || {}).length;
  const commentsQuantity = Object.keys(post.comments as Object || {}).length;

  return (
    <>
      <div className="loggedin-content-post p-2 bg-primary rounded mb-3">
        <div>
          <div className="d-flex w-100 justify-content-between align-items-center mb-2">
            <div className="post-owner-info d-flex align-items-center gap-2">
              <img onClick={() => {navigate(`${post.by}`); setTrigger(prev => !prev)}} className="image cursor-pointer" src={post.photoURL} alt="user image" />
              <div className="post-text d-flex flex-md-row flex-column align-items-md-center gap-md-4">
                <span className="fs-5">{post.displayName}</span>
                <small className="opacity-50">Date: {post.date}</small>
              </div>
            </div>
            {post.by === currentUser?.uid &&
              <NavDropdown title={<BiDotsHorizontalRounded style={{width: 25, height: 25}} className="align-self-start cursor-pointer mb-0 py-0 post-options-button" />}>
                <NavDropdown.Item onClick={() => setPostPromptVisible(true)}>Edit</NavDropdown.Item>
                <NavDropdown.Item onClick={() => handlePostDelete(post, props.postKey)}>Delete Post</NavDropdown.Item>
              </NavDropdown>
            }
          </div>
          <div className="d-inline post-text">
            {post.text &&
              <p className={post.text.length <= 50 ? "mb-0 fs-4" : "mb-0"}>
              {
                props.extendedPost === post.postId ?
                  renderPost(post.text)
                : 
                  needsExtension.needs ?
                    renderPost(
                      needsExtension.why === "length" ? 
                        post.text.substring(0, 147) + " ..."
                      : 
                        post.text.substring(0, newLines[0]) + " ..."
                    ) 
                  : renderPost(post.text)
              }
            </p>
            }
            {
              needsExtension.needs && <small onClick={() => {
                  props.extendedPost === post.postId ? props.setExtendedPost("") : props.setExtendedPost(post.postId);
                }} role="button" className="post-text extension text-hover-secondary w-100 d-flex justify-content-end">
                {props.extendedPost !== post.postId ? "... See More" : "Show Less"}
              </small>
            }
          </div>
          {post.media ?
            post.media.type === "image" ?
              <>
                <hr className="mb-1 mt-1"/>
                <img onClick={(e) => {
                  const src = (e.target as HTMLImageElement).src;
                  setShowPostImage({isOpen: true, imageSrc: src, type: "post"})
                }} className="w-100 rounded object-fit-cover cursor-pointer" style={{maxHeight: 350}} src={post.media.url!} alt="user post image" />
              </>
            : post.media.type === "video" ?
              <div className="w-100">
                <hr className="mb-1 mt-1"/>
                <video playsInline={true} style={{maxHeight: 450}} className="w-100 rounded object-fit-cover" controls>
                  <source className="w-100" src={post.media.url!} type="video/mp4" />
                </video>
              </div>
            : null
          : null
          }
          <hr className="mb-1 mt-1"/>
          <div className="post-text mb-2 d-flex justify-content-between">
            <small>{likesQuantity ? `${likesQuantity} Likes` : null}</small>
            <small>{commentsQuantity ? `${commentsQuantity} Comments` : null}</small>
          </div>
          <div className="post-buttons w-100 d-flex gap-2">
            <button onClick={() => handleLike(post)} className={`${isPostLiked && "post-button-activated"} w-100 post-button rounded text-secondary d-flex align-items-center justify-content-center gap-2`}>
              <FaThumbsUp />
              <span>{post.likes && (currentUser!.uid in post.likes) ? "liked" : "Like"}</span>
            </button>
            <button className="w-100 post-button rounded text-secondary d-flex align-items-center justify-content-center gap-2">
              <FaRegCommentDots />
              <span>Comment</span>
            </button>
          </div>
        </div>
      </div>
      {
        postPromptVisible && <div className="user-prompt">
          <div className="bg-secondary rounded py-2 px-1 col-md-6 col-sm-11 col-12">
            <textarea
              autoFocus
              onChange={(e) => setPostInputValue(e.target.value)}
              value={postInputValue}
              className="textarea-for-post w-100"
              placeholder={`Hello ${currentUser?.displayName?.split(" ")[0]}, Would you like to edit your post ?`}
            />
            <small onClick={() => setPostInputValue("")} role="button" className="text-primary text-decoration-underline">clear</small>
            <div className="mt-2 d-flex justify-content-center gap-3">
              <button onClick={() => {setPostPromptVisible(false); handlePostEdit(post, props.postKey);}} style={{width: 80}} disabled={!post.media.url && !postInputValue.trim()} className="action-button rounded">
                Edit
              </button>
              <button style={{width: 80}} onClick={() => setPostPromptVisible(false)} className="action-button rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
      {
        showPostImage.isOpen && <BigImage isImageOpen={showPostImage} setIsImageOpen={setShowPostImage} options={{hasDownload: true}} />
      }
    </>
  );
}

export default Post