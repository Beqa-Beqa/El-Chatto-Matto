import React, { useContext, useEffect, useState } from "react";
import { findAllInstances } from "../../../../functions/general";
import { AuthContext } from "../../../../contexts/AuthContextProvider";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaRegCommentDots } from "react-icons/fa6";
import { NavDropdown } from "react-bootstrap";
import { FaThumbsUp } from "react-icons/fa"
import { useNavigate } from "react-router-dom";
import { RemoteUserContext } from "../../../../contexts/RemoteUserContextProvider";
import { UserChatsContext } from "../../../../contexts/UserChatsContextProvider";
import { BigImage } from "../../..";
import { renderText } from "../../Chat/ChatBoxMessages";
import { handlePostDelete, handlePostEdit, handlePostLike } from "./post-functions";
import Comments from "./SubComponents/Comments";

const Post = (props: {
  postKey: string, 
  postsData: {[key: string]: PostData},
  setPostsData: React.Dispatch<React.SetStateAction<{
    [key: string]: PostData;
  }>>,
  extendedPost: string,
  setExtendedPost: React.Dispatch<React.SetStateAction<string>>,
  classname?: string
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
  // state for displaying post image on fullscreen.
  const [showPostImage, setShowPostImage] = useState<{isOpen: boolean, imageSrc: string, type: string}>({isOpen: false, imageSrc: "", type: ""});
  // state for showing comments.
  const [showComments, setShowComments] = useState<boolean>(false);

  // state for error.
  const [error, setError] = useState<{type: string, text: string}>({type: "", text: ""});

  // navigate for navigating through urls.
  const navigate = useNavigate();

  const isPostLiked = post.likes ? currentUser!.uid in post.likes : false;
  const likesQuantity = Object.keys(post.likes as Object || {}).length;
  const commentsQuantity = Object.keys(post.comments as Object || {}).reduce((quantity: number, key: string) => {
    if(post.comments) {
      quantity += post.comments[key].comments.length;
      return quantity;
    } else {
      return 0;
    }
  }, 0);

  useEffect(() => {
    setShowComments(false);
  }, [Object.keys(props.postsData).length]);

  return (
    <>
      <div className={`loggedin-content-post p-2 bg-primary ${props.classname} ${showComments ? "rounded-top" : "rounded"}`}>
        <div>
          <div className="d-flex w-100 justify-content-between align-items-center mb-2">
            <div className="post-owner-info d-flex align-items-center gap-2">
              <img onClick={() => {navigate(`/${post.by}`); setTrigger(prev => !prev)}} className="image cursor-pointer" src={post.photoURL} alt="user image" />
              <div className="post-text d-flex flex-md-row flex-column align-items-md-center gap-md-4">
                <span className="fs-5">{post.displayName}</span>
                <small className="opacity-50">{new Date(post.date).toLocaleString()}</small>
              </div>
            </div>
            {post.by === currentUser?.uid &&
              <NavDropdown title={<BiDotsHorizontalRounded style={{width: 25, height: 25}} className="align-self-start cursor-pointer mb-0 py-0 post-options-button" />}>
                <NavDropdown.Item onClick={() => setPostPromptVisible(true)}>Edit</NavDropdown.Item>
                <NavDropdown.Item onClick={() => handlePostDelete(currentUser, props.postsData, props.setPostsData, post, postsCount, props.postKey)}>Delete Post</NavDropdown.Item>
              </NavDropdown>
            }
          </div>
          <div className="d-inline post-text">
            {post.text &&
              <p className={post.text.length <= 50 ? "mb-0 fs-4" : "mb-0"}>
              {
                props.extendedPost === post.postId ?
                  renderText(post.text)
                : 
                  needsExtension.needs ?
                    renderText(
                      needsExtension.why === "length" ? 
                        post.text.substring(0, 147) + " ..."
                      : 
                        post.text.substring(0, newLines[0]) + " ..."
                    ) 
                  : renderText(post.text)
              }
              </p>
            }
            {
              needsExtension.needs && <small onClick={() => {
                  props.extendedPost === post.postId ? props.setExtendedPost("") : props.setExtendedPost(post.postId);
                }} role="button" className="post-text extension w-100 d-flex justify-content-end">
                {props.extendedPost !== post.postId ? "... See More" : "Show Less"}
              </small>
            }
          </div>
          {post.media ?
            post.media.type === "image" ?
              <>
                <hr className="my-1 post-text"/>
                <img onClick={(e) => {
                  const src = (e.target as HTMLImageElement).src;
                  setShowPostImage({isOpen: true, imageSrc: src, type: "post"})
                }} className="w-100 rounded object-fit-contain cursor-pointer" style={{maxHeight: 350, backgroundColor: "black"}} src={post.media.url!} alt="user post image" />
              </>
            : post.media.type === "video" ?
              <>
                <hr className="my-1 post-text"/>
                <video playsInline={true} style={{maxHeight: 450, backgroundColor: "black"}} className="w-100 rounded object-fit-contain" controls>
                  <source src={post.media.url!} type="video/mp4" />
                </video>
              </>
            : null
          : null
          }
          <hr className="my-1 post-text"/>
          <div className="post-text mb-2 d-flex justify-content-between">
            <small>{likesQuantity ? `${likesQuantity} Likes` : null}</small>
            <small>{commentsQuantity ? `${commentsQuantity} Comments` : null}</small>
          </div>
          <div className="post-buttons w-100 d-flex gap-2">
            <button onClick={() => handlePostLike(currentUser!, props.postsData, props.setPostsData, post)} className={`${isPostLiked && "post-button-activated"} w-100 post-button rounded text-secondary d-flex align-items-center justify-content-center gap-2`}>
              <FaThumbsUp />
              <span>{post.likes && (currentUser!.uid in post.likes) ? "liked" : "Like"}</span>
            </button>
            <button onClick={() => setShowComments(!showComments)} className="w-100 post-button rounded text-secondary d-flex align-items-center justify-content-center gap-2">
              <FaRegCommentDots />
              <span>Comment</span>
            </button>
          </div>
          {showComments && <hr className="mb-1 mt-2" />}
        </div>
      </div>
      {
        showComments ? <Comments postKey={props.postKey} setPostsData={props.setPostsData} postsData={props.postsData} /> : <div className="mb-3"/>
      }
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
            <div className="d-flex align-items-center justify-content-between flex-md-row flex-column">
              <div className="d-flex gap-1 flex-column align-items-center align-items-md-start">
                <small onClick={() => setPostInputValue("")} role="button" className="text-primary text-decoration-underline">clear text</small>
              </div>
              <span className={`fw-bold text-danger ${error.type === "Post" ? "d-block" : "d-none"}`}>{error.text}</span>
            </div>
            <div className="mt-2 d-flex justify-content-center gap-3">
              <button onClick={() => handlePostEdit(props.postsData, props.setPostsData ,post, props.postKey, postInputValue, setError, setPostPromptVisible)} style={{width: 80}} disabled={!post.media.url && !postInputValue.trim()} className="action-button rounded">
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