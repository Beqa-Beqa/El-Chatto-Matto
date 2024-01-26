import { useContext, useRef, useState } from "react";
import { RemoteUserContext } from "../contexts/RemoteUserContextProvider";
import { Camera } from "../assets/images";
import { GeneralContext } from "../contexts/GeneralContextProvider";
import { Footer, NavbarLoggedIn, PhotosContainer } from "../containers";
import { FriendsContainer } from "../containers";
import { BigImage, MessagingWindow, Post } from "../components";
import { AuthContext } from "../contexts/AuthContextProvider";
import { UserChatsContext } from "../contexts/UserChatsContextProvider";
import { deletePrompt } from "../App";
import { handleCancelFriendRequest, handleRequestAnswer, handleSendFriendRequest } from "../functions/firebase";
import { firestore } from "../config/firebase";
import { useOutsideClick } from "../hooks";
import { FaRegEnvelope } from "react-icons/fa";
import { IoMdPersonAdd, IoMdClose } from "react-icons/io";
import { IoPersonRemove } from "react-icons/io5";
import { PostsContext } from "../contexts/PostsContextProvider";

const RemoteUserProfile = () => {
  // info of current user.
  const {currentUser} = useContext(AuthContext);
  // Current user friends id array data.
  const {friends, requestsSent} = useContext(UserChatsContext);
  // Info about remote user on whose profile we are.
  const {remUserGenInfo, remUserUserChatsInfo} = useContext(RemoteUserContext);
  // With of window.
  const {width} = useContext(GeneralContext);
  // State for checking if image is open or not.
  const [isImageOpen, setIsImageOpen] = useState<{isOpen: boolean, imageSrc: string, type: string}>({isOpen: false, imageSrc: "", type: ""});
  // posts info.
  const {postsData, setPostsData} = useContext(PostsContext);
  // State for delte prompt.
  const [isDeletePromptOpen, setIsDeletePromptOpen] = useState<boolean>(false);
  // Dynamic styles for profile image container.
  const profileImageContainerStyles = width > 574 ? {top: -60} : {top: -30};
  // Dynamic styles for profile image.
  const profileImageStyles = width > 574 ? {width: 150, height: 150, top: -60} : {width: 100, height: 100, top: -30};

  // State for showing messaging window.
  const [showMessagingWindow, setShowMessagingWindow] = useState<boolean>(false);
  // styles of messaging window.
  const messagingWindowStyles = width > 574 ? {width: 370, height: 520} : {width: "100%", height: "90vh"};
  // Prompt reference and useoutsideclick custom hook to update state on outside click.
  const deletePromptRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick(deletePromptRef, setIsDeletePromptOpen, false);

  const [extendedPost, setExtendedPost] = useState<string>("");

  let postsByRemoteUser: {[key: string]: PostData} = {};
  for(let key in postsData) {
    if(postsData[key].by === remUserGenInfo.uid) {
      postsByRemoteUser[key] = postsData[key];
    }
  }

  return (
    <div className="profile-page">
      <header>
        <NavbarLoggedIn />
      </header>
      <main>
        <div className="user-profile px-2 pt-5 mt-4">
          <div className="cover-user-image h-100 w-100 d-flex justify-content-center align-items-end rounded">
            <div className="image-container">
              {remUserGenInfo.coverURL ? <img onClick={(e) => {
                    const target = e.target as HTMLImageElement;
                    setIsImageOpen({isOpen: true, imageSrc: target.src, type: "cover"});
                  }} className="cursor-pointer" src={remUserGenInfo.coverURL} alt="user cover image" />
                :  
                  <img src={Camera} alt="placeholder camera image"/>
              }
            </div>
          </div>
          <div className="profile-image-container w-100 d-flex flex-column justify-content-center align-items-center">
            <div style={profileImageContainerStyles} className="d-flex flex-column w-100 h-100 align-items-center position-relative">
              {remUserGenInfo.defaultPhotoURL !== remUserGenInfo.photoURL ? <img onClick={(e) => {
                    const target = e.target as HTMLImageElement;
                    setIsImageOpen({isOpen: true, imageSrc: target.src, type: "profile"});
                  }} style={profileImageStyles} className="rounded-circle cursor-pointer object-fit-cover bg-primary" src={remUserGenInfo.photoURL} alt="user" />
                :
                  <img style={profileImageStyles} className="rounded-circle object-fit-cover bg-primary" src={remUserGenInfo.photoURL} alt="placeholder camera image"/>
              }
              <h3 className="text-primary mt-2">{remUserGenInfo.displayName}</h3>
            </div>
            <span style={{...profileImageContainerStyles, maxWidth: 500, overflowWrap: "break-word"}} className="position-relative text-center w-100"><span>{remUserGenInfo.bio || ""}</span></span> 
            <div style={profileImageContainerStyles} className="profile-buttons position-relative mt-2 d-flex gap-2">
              {friends &&
                friends.includes(remUserGenInfo.uid) ?
                  <>
                    <button onClick={() => setShowMessagingWindow(true)} style={{width: 145}} className="action-button rounded d-flex align-items-center justify-content-center gap-2">
                      Message <FaRegEnvelope className="action-button-icon" />
                    </button>
                    <button onClick={() => setIsDeletePromptOpen(true)} style={{width: 145}} className="action-button rounded d-flex align-items-center justify-content-center gap-2">
                      Delete Friend <IoPersonRemove className="action-button-icon" />
                    </button>
                  </>
                  :
                    requestsSent.includes(remUserGenInfo.uid) ?
                      <button onClick={async () => {
                        await handleCancelFriendRequest(firestore, currentUser!, remUserGenInfo);
                      }} className="action-button rounded d-flex align-items-center justify-content-center gap-2">Cancel Friend Request <IoMdClose className="action-button-icon" /></button>
                    :
                      <button onClick={async () => {
                        await handleSendFriendRequest(firestore, currentUser!, remUserGenInfo);
                      }} className="action-button rounded d-flex align-items-center justify-content-center gap-2">Send Friend Request <IoMdPersonAdd className="action-button-icon" /></button>
                  
              }
            </div>
            <div style={profileImageContainerStyles} className={`${width > 574 && "fs-5"} d-flex justify-content-center position-relative mt-3`}>
              <span>{(remUserUserChatsInfo.friends || []).length} Friends</span>
              <hr style={{width: 20, transform: "rotate(90deg)"}} className="mx-2"/>
              <span>{remUserUserChatsInfo.postsCount} Posts</span>
              <hr style={{width: 20, transform: "rotate(90deg)"}} className="mx-2"/>
              <span>{Object.keys(remUserGenInfo.profileImageRefs || {}).length} Photos</span>
            </div>
          </div>
          <div className="d-flex flex-column flex-lg-row gap-lg-5 gap-3">
            <div className="col-lg-4 col-12"> 
              <div className="profile-photos mb-4">
                <h5>Photos</h5>
                <hr/>
                <PhotosContainer isOwner={false}/>
              </div>
              <div className="profile-friends mb-4">
                <h5>Mutual friends with {remUserGenInfo.displayName}</h5>
                <hr/>
                <FriendsContainer friendsPage={false} isOwner={false} />
              </div>
            </div>
            <div className="posts-container col-12 col-lg-7">
              <h5>Posts</h5>
              <hr/>
              {Object.keys(postsByRemoteUser).length ?
                Object.keys(postsByRemoteUser).map((postKey: string, key: number) => {
                  return <Post 
                  postsData={postsData} 
                  setPostsData={setPostsData} 
                  postKey={postKey} 
                  key={key} 
                  extendedPost={extendedPost}
                  setExtendedPost={setExtendedPost}
                  />
                })
                : <div className="w-100 text-center mb-3"><span className="fs-1 text-muted">No posts to show</span></div>
              }
            </div>
          </div>
        </div>
      </main>
      <footer>
        <Footer />
      </footer>
      {isImageOpen.isOpen && <BigImage options={{hasDelete: false, hasDownload: true, hasUpload: false}} isImageOpen={isImageOpen} setIsImageOpen={setIsImageOpen} />}
      {showMessagingWindow && <MessagingWindow styles={messagingWindowStyles} setShowMessagingWindow={setShowMessagingWindow} user={remUserGenInfo} classname="position-fixed bottom-0 end-0 me-md-5 bg-primary" />}
      {isDeletePromptOpen &&
      <div className="user-prompt">
        <div ref={deletePromptRef}>
          {deletePrompt(remUserGenInfo.displayName, async () => {
            setIsDeletePromptOpen(false);
            await handleRequestAnswer(firestore, currentUser!, "delete", remUserGenInfo.uid);
          }, () => {
            setIsDeletePromptOpen(false);
          })}
        </div>
      </div>
      }
    </div>
  );
}

export default RemoteUserProfile;