import { FaImage } from "react-icons/fa"
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { AiOutlineSend } from "react-icons/ai";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../../contexts/AuthContextProvider";
import { doc, updateDoc } from "firebase/firestore";
import { firestore, storage } from "../../../../../config/firebase";
import uuid from "react-uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { isValidImageOrVideo, sortObject } from "../../../../../functions/general";
import { renderText } from "../../../Chat/ChatBoxMessages";

const Comments = (props: {
  postKey: string, 
  postsData: {[key: string]: PostData},
  setPostsData: React.Dispatch<React.SetStateAction<{
    [key: string]: PostData;
  }>>,
}) => {
  // Post data
  const post: PostData = props.postsData[props.postKey];
  // Currentuser information.
  const {currentUser} = useContext(AuthContext);

  // State for storing comments data of the current post.
  const [commentsData, setCommentsData] = useState<PostCommentData | undefined>(post.comments);
  // State for comment text.
  const [commentInput, setCommentInput] = useState<string>("");
  // State for comment media (image or video).
  const [commentMedia, setCommentMedia] = useState<File | null>(null);
  // State for showing picker (emojis).
  const [showPicker, setShowPicker] = useState<boolean>(false);
  // Filtered comments for display purposes.
  const [filteredComments, setFilteredComments] = useState<any>({});
  // Set limit of comments for how many to show.
  const [limit, setLimit] = useState<number>(3);
  // Error state
  const [error, setError] = useState<{type: string, text: string}>({type: "", text: ""});
  // Comments cache state
  const [commentsCache, setCommentsCache] = useState(JSON.parse(window.localStorage.getItem("comments") || "{}"));

  useEffect(() => {
    const comments: any = {};

    for(let user in commentsData) {
      const userInfo = commentsData[user];
      userInfo.comments.map((comment: PostComment) => {
        if(!comment.isReply) {
          const dateInUnix = new Date(comment.date).getTime();
          comments[dateInUnix] = {...comment,
            userId: user,
            displayName: userInfo.displayName,
            photoURL: userInfo.photoURL
          };
        }
      });
    }
    
    setFilteredComments(sortObject(comments, false));
  }, [commentsData]);

  // handle commenting on the post.
  const handleCommentUpload = async () => {
    const text = commentInput.trim();

    if (text || commentMedia) {
      const uid = uuid();
      const commentToUpload: PostComment = {
        date: new Date().toLocaleString(),
        id: uid,
        mediaUrl: {
          type: null,
          url: null
        },
        text: ""
      }
      try {
        if(text.length > 5000) throw Error("Characters exceed 5000");
        commentToUpload.text = text || null;
        setCommentInput("");

        let downloadUrl: string | null = null;

        const isValidMedia = commentMedia && isValidImageOrVideo(commentMedia);

        let commentCacheIndex = Object.keys(commentsCache).length;
        window.localStorage.setItem("comments", JSON.stringify({
          ...commentsCache,
          [commentCacheIndex]: {
            text: commentToUpload.text,
            mediaUrl: {
              type: isValidMedia ? isValidMedia.type : null,
              url: isValidMedia ? URL.createObjectURL(commentMedia) : null
            }
          }
        }));
        setCommentsCache(JSON.parse(window.localStorage.getItem("comments") || "{}"));

        if(isValidMedia?.isValid) {
          const commentMediaStorageRef = ref(storage, `postComments/${post.postId}/${uid}`);
          await uploadBytesResumable(commentMediaStorageRef, commentMedia!);
          downloadUrl = await getDownloadURL(commentMediaStorageRef);
        }

        commentToUpload.mediaUrl = {
          type: isValidMedia ? isValidMedia.type : null,
          url: downloadUrl
        }

        setCommentMedia(null);

        const commentsByCurrentUser = commentsData && commentsData[currentUser!.uid] && commentsData[currentUser!.uid].comments;

        const currentUserCommentData: any = {
          photoURL: currentUser!.photoURL!,
          displayName: currentUser!.displayName!,
          comments: commentsByCurrentUser ? [...commentsByCurrentUser, commentToUpload]
          : [commentToUpload]
        }

        const newCommentsData: PostCommentData = {...commentsData};
        newCommentsData[currentUser!.uid] = currentUserCommentData;

        const postDocRef = doc(firestore, "posts", post.postId);
        const updateChunk: any = {};
        updateChunk[`comments.${currentUser!.uid}`] = currentUserCommentData;
        await updateDoc(postDocRef, updateChunk);

        window.localStorage.removeItem("comments");
        setCommentsCache({});
        setCommentsData(newCommentsData);

        const postsData: any = {...props.postsData}
        postsData[props.postKey].comments = newCommentsData;
        props.setPostsData(postsData);        

        setError({text: "", type: ""});
      } catch (err) {
        const error = err as Error;
        setError({
          type: "Comment",
          text: error.message
        });
      }
    }
  }

  const handleKeyDown = (event: any) => {
    if(event.code === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleCommentUpload();
    }
  }

  let commentKeyRef: number = -1;

  return (
    <div className="comments w-100 bg-primary mb-3 pb-1 px-2 rounded-bottom">
      <div className="px-2 pt-2">
        {
          Object.keys(commentsCache).length ?
            Object.keys(commentsCache).sort().map((commentKey: string, key: number) => {
              const comment: any = commentsCache[commentKey];

              return <React.Fragment key={key}>
                <span className="post-text opacity-75">Commenting...</span>
                <div className="d-flex gap-2 align-items-start post-text mb-2 opacity-50">
                  <img className="image mt-1" src={currentUser!.photoURL!} alt="user"/>
                  <div className="d-flex flex-column">
                    <div className="d-flex align-items-center">
                      <span className="text-secondary">{currentUser!.displayName}</span>
                    </div>
                    {comment.text && <p style={{fontSize: 15}} className="mb-0">{renderText(comment.text)}</p>}
                    {comment.mediaUrl && 
                      comment.mediaUrl.type === "image" ?
                        <img style={{maxHeight: 250}} className="w-100 rounded mt-2" src={comment.mediaUrl.url} alt="comment"/>
                      : comment.mediaUrl.type === "video" ?
                        <video autoPlay muted style={{maxHeight: 250}} className="w-100 rounded">
                          <source className="w-100" src={comment.mediaUrl.url} type="video/mp4"/>
                        </video>
                      : null
                      }
                  </div>
                </div>
              </React.Fragment>
            })
          : null
        }
        {
          Object.keys(filteredComments).length ?
            Object.keys(filteredComments).map((commentKey: string, key: number) => {
              const comment: any = filteredComments[commentKey];
              commentKeyRef++;

              return commentKeyRef < limit && <div className="d-flex gap-2 align-items-start post-text mb-2" key={key}>
                <img className="image mt-1" src={comment.photoURL} alt="user"/>
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-secondary">{comment.displayName}</span>
                    <span className="opacity-50">at {comment.date.split(",")[0]}</span>
                  </div>
                  {comment.text && <p style={{fontSize: 15}} className="mb-0">{renderText(comment.text)}</p>}
                  {comment.mediaUrl ? 
                    comment.mediaUrl.type === "image" ?
                      <img style={{maxHeight: 250}} className="w-100 rounded mt-2" src={comment.mediaUrl.url} alt="comment"/>
                    : comment.mediaUrl.type === "video" ?
                      <video controls playsInline style={{maxHeight: 250}} className="w-100 rounded">
                        <source className="w-100" src={comment.mediaUrl.url} type="video/mp4"/>
                      </video>
                    : null
                  : null
                  }
                </div>
              </div>
            })
          : null
        }
      </div>
      {
        commentKeyRef >= limit && <div className="w-100 d-flex justify-content-end">
          <small 
            onClick={() => setLimit(prev => prev + 10)} 
            role="button" 
            className="post-text extension pb-2 pe-2"
          > Show more comments... </small>
        </div>
      }
      <div className="comments-input w-100 d-flex align-items-center gap-2">
        <textarea 
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          style={{resize: "none", outline: "none"}} 
          className="w-100 rounded"
          onKeyDown={handleKeyDown}
        />
        <div className="d-flex gap-2">
          <label htmlFor="comment-media-holder" className="chat-box-input-icon">
            <FaImage />
          </label>
          <input onChange={(e) => {
            e.target.files && setCommentMedia(e.target.files[0]);
          }} id="comment-media-holder" hidden type="file" />
          <div onClick={() => setShowPicker(!showPicker)} className="chat-box-input-icon">
            <MdOutlineEmojiEmotions />
          </div>
          <div onClick={handleCommentUpload} className="chat-box-input-icon">
            <AiOutlineSend />
          </div>
        </div>
      </div>
      {error && <span className="text-danger fw-bold">{error.text}</span>}
    </div>
  );
}

export default Comments;