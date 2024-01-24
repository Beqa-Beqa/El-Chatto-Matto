import { useNavigate } from "react-router-dom";
import { FaImage, FaPhotoVideo } from "react-icons/fa";
import { RemoteUserContext } from "../../../../contexts/RemoteUserContextProvider";
import { useContext, useState } from "react";
import { AuthContext } from "../../../../contexts/AuthContextProvider";
import { UserChatsContext } from "../../../../contexts/UserChatsContextProvider";
import uuid from "react-uuid";
import { setDoc, doc, updateDoc } from "firebase/firestore";
import { firestore, storage } from "../../../../config/firebase";
import { isValidImageOrVideo, sortObject } from "../../../../functions/general";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const WritePost = (props: {
  postsData: {
    [key: string]: PostData;
  },
  setPostsData: React.Dispatch<React.SetStateAction<{
    [key: string]: PostData;
  }>>
}) => {
  // trigger for refetching data.
  const {setTrigger} = useContext(RemoteUserContext);

  // Information about current user.
  const {currentUser} = useContext(AuthContext);

  // info about users posts count
  const {postsCount} = useContext(UserChatsContext);

  // state for showing post prompt.
  const [postPromptVisible, setPostPromptVisible] = useState<boolean>(false);
  // state for storing post input value.
  const [postInputValue, setPostInputValue] = useState<string>("");

  const [postMedia, setPostMedia] = useState<File | null>(null);

  // navigate for navigating through urls.
  const navigate = useNavigate();

  const handlePostUpload = async () => {
    const mediaValidity = postMedia && isValidImageOrVideo(postMedia);

    if(postInputValue.trim() || (mediaValidity && mediaValidity.isValid)) {

      const text: string | null = postInputValue.trim() ? postInputValue.trim() : null;
      const media: File | null = postMedia && isValidImageOrVideo(postMedia) ? postMedia : null;
      const uid: string = uuid();
      const postRef = doc(firestore, "posts", uid);
      const currentUserChatsRef = doc(firestore, "userChats", currentUser!.uid);
      const currentDate = new Date().toLocaleString();
      const currentUnix = new Date(currentDate).getTime();

      setPostPromptVisible(false);
      setPostInputValue("");

      let downloadUrl: string | null = null;
      const postStorageRefString = media ? `postMedia/${currentUser!.uid}/${uuid()}` : null;
      const postStorageRef =  media ? ref(storage, postStorageRefString!) : undefined;

      if(postStorageRef) {
        await uploadBytesResumable(postStorageRef, media!);
        downloadUrl = await getDownloadURL(postStorageRef);
      }
      
      const postToUpload: PostData = {
        text: text,
        media: {
          url: downloadUrl,
          ref: postStorageRefString,
          type: mediaValidity?.type || null
        }, 
        by: currentUser!.uid, 
        date: currentDate,
        photoURL: currentUser!.photoURL!,
        displayName: currentUser!.displayName!,
        postId: uid
      }

      setPostMedia(null);

      await setDoc(postRef, postToUpload);
      await updateDoc(currentUserChatsRef, {
        postsCount: postsCount + 1
      });

      let newPostsData = {...props.postsData};
      newPostsData[currentUnix] = postToUpload;
      newPostsData = sortObject(newPostsData);
      props.setPostsData(newPostsData);
    }
  }

  return (
    <>
      <div className="w-100 ps-lg-0 pe-lg-0 pe-2 ms-lg-5 rounded mb-3">
        <div className="p-2 bg-primary rounded d-flex flex-column">
          <div className="d-flex align-items-center">
            <img onClick={() => {navigate(`/${currentUser?.uid}`); setTrigger(prev => !prev)}} role="button" className="image me-2" src={currentUser?.photoURL!} alt="your image" />
            <button onClick={() => setPostPromptVisible(true)} className="post-input-button">
              Hello {currentUser?.displayName?.split(" ")[0]}, Would you like to share your thoughts ?
            </button>
          </div>
          <label htmlFor="post-image-input" className="d-flex mt-3">
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
          </label>
          <input id="post-image-input" hidden type="file" onChange={(e) => setPostMedia(e.target.files ? e.target.files[0] : null)} />
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
              placeholder={`Hello ${currentUser?.displayName?.split(" ")[0]}, Would you like to share your thoughts ?`}
            />
            <small onClick={() => setPostInputValue("")} role="button" className="text-primary text-decoration-underline">clear</small>
            <div className="mt-2 d-flex justify-content-center gap-3">
              <button onClick={handlePostUpload} style={{width: 80}} disabled={!postInputValue.trim() && !postMedia} className="action-button rounded">
                Post
              </button>
              <button style={{width: 80}} onClick={() => {setPostPromptVisible(false); setPostMedia(null);}} className="action-button rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </>
  );
}

export default WritePost;