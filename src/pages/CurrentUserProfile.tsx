import { useContext, useState } from "react";
import { RemoteUserContext } from "../contexts/RemoteUserContextProvider";
import { Camera } from "../assets/images";
import { GeneralContext } from "../contexts/GeneralContextProvider";
import { Footer, NavbarLoggedIn, PhotosContainer } from "../containers";
import { AuthContext } from "../contexts/AuthContextProvider";
import { FriendsContainer } from "../containers";
import BigImage, { userImageUpload } from "../components/LoggedIn/Profile/BigImage";
import { MdEdit } from "react-icons/md";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../config/firebase";
import { PostsContext } from "../contexts/PostsContextProvider";
import { Post } from "../components";

const CurrentUserProfile = () => {
  // Current user.
  const {currentUser} = useContext(AuthContext);
  // Info about remote user on whose profile we are.
  const {remUserGenInfo, remUserUserChatsInfo} = useContext(RemoteUserContext);
  // With of window.
  const {width} = useContext(GeneralContext);
  // State for checking if image is open or not.
  const [isImageOpen, setIsImageOpen] = useState<{isOpen: boolean, imageSrc: string, type: string}>({isOpen: false, imageSrc: "", type: ""});
  // State for bio edit.
  const [showBioEdit, setShowBioEdit] = useState<boolean>(false);
  // Trigger for refetching info.
  const {setTrigger} = useContext(RemoteUserContext);
  // Posts data.
  const {postsData, setPostsData} = useContext(PostsContext);
  // Dynamic styles for profile image container.
  const profileImageContainerStyles = width > 574 ? {top: -60} : {top: -30};
  // Dynamic styles for profile image.
  const profileImageStyles = width > 574 ? {width: 150, height: 150, top: -60} : {width: 100, height: 100, top: -30};
  // Dynamic styles for bigger image.

  let postsByCurrentUser: {[key: string]: PostData} = {};
  for(let key in postsData) {
    if(postsData[key].by === currentUser?.uid) {
      postsByCurrentUser[key] = postsData[key];
    }
  }

  const [extendedPost, setExtendedPost] = useState<string>("");

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
                  <>
                    <label onClick={() => setIsImageOpen({isOpen: false ,imageSrc: "",type: "cover"})} htmlFor="inp-cover">
                      <img className="cursor-pointer" src={Camera} alt="placeholder camera image"/>
                    </label>
                    <input onChange={async (e) => {
                      const target = e.target as HTMLInputElement;
                      const image = target.files![0] || null;
                      await userImageUpload(isImageOpen.type, image, currentUser!, remUserGenInfo);
                      setTrigger(prev => !prev);
                    }} id="inp-cover" hidden type="file" />
                  </>
              }
            </div>
          </div>
          <div className="profile-image-container w-100 d-flex flex-column justify-content-center align-items-center">
            <div style={profileImageContainerStyles} className="d-flex flex-column w-100 h-100 align-items-center position-relative">
              {remUserGenInfo.defaultPhotoURL !== remUserGenInfo.photoURL ? <img onClick={(e) => {
                      const target = e.target as HTMLImageElement;
                      setIsImageOpen({isOpen: true, imageSrc: target.src, type: "profile"});
                    }} style={{...profileImageStyles, backgroundColor: "black"}} className="rounded-circle cursor-pointer object-fit-contain" src={remUserGenInfo.photoURL} alt="user" />
                : 
                  <>
                    <label style={{zIndex: 15}} onClick={() => setIsImageOpen({isOpen: false , imageSrc:"", type: "profile"})} htmlFor="inp-profile">
                      <img style={profileImageStyles} className="rounded-circle cursor-pointer object-fit-cover bg-primary" src={remUserGenInfo.photoURL} alt="placeholder camera image"/>
                    </label>
                    <input onChange={async (e) => {
                      const target = e.target as HTMLInputElement;
                      const image = target.files![0] || null;
                      await userImageUpload(isImageOpen.type, image, currentUser!, remUserGenInfo);
                      setTrigger(prev => !prev);
                    }} id="inp-profile" hidden type="file" />
                  </>
              }
              <h3 className="text-primary mt-2">{remUserGenInfo.displayName}</h3>
            </div>
            {!showBioEdit ? 
              <span style={{...profileImageContainerStyles, maxWidth: 500, overflowWrap: "break-word"}} className="position-relative text-center w-100"><span onClick={() => setShowBioEdit(true)} className="cursor-pointer">{remUserGenInfo.bio || "Write your bio..."} <MdEdit /></span></span> 
            : 
              <div className="position-relative d-flex flex-column gap-2 align-items-center w-100" style={{...profileImageContainerStyles, maxWidth: 500}}>
                <textarea autoFocus style={{resize: "none", outline: "none"}} className="text-center w-100 bg-transparent rounded" id="bio-input"/>
                <label className="d-flex gap-2" htmlFor="bio-input">
                  <button onClick={async () => {
                    const textareaValue = (document.getElementById("bio-input") as HTMLTextAreaElement).value;
                    setShowBioEdit(false);
                    await updateDoc(doc(firestore, "users", currentUser?.uid!), {bio: textareaValue});
                    setTrigger(prev => !prev);
                  }} className="action-button rounded" style={{width: 70}}>Save</button>
                  <button onClick={() => setShowBioEdit(false)} className="action-button rounded" style={{width: 70}}>Cancel</button>
                </label>
              </div>
            }
            <div style={profileImageContainerStyles} className={`${width > 574 && "fs-5"} d-flex justify-content-center position-relative mt-3`}>
              <span>{(remUserUserChatsInfo.friends || []).length} Friends</span>
              <hr style={{width: 20, transform: "rotate(90deg)"}} className="mx-2"/>
              <span>{remUserUserChatsInfo.postsCount || 0} Posts</span>
              <hr style={{width: 20, transform: "rotate(90deg)"}} className="mx-2"/>
              <span>{Object.keys(remUserGenInfo.profileImageRefs || {}).length} Photos</span>
            </div>
          </div>
          <div className="d-flex flex-column flex-lg-row gap-lg-5 gap-3">
            <div className="col-lg-4 col-12">
              <div className="profile-photos mb-4">
                <h5>Cover Photos</h5>
                <hr />
                <PhotosContainer type="cover" isOwner imagesPage={false}/>
              </div>
              <div className="profile-photos mb-4">
                <h5>Profile Photos</h5>
                <hr />
                <PhotosContainer type="profile" isOwner imagesPage={false}/>
              </div>
              <div className="profile-friends mb-4">
                <h5>Friends</h5>
                <hr/>
                <FriendsContainer friendsPage={false} isOwner={true} />
              </div>
            </div>
            <div className="posts-container col-12 col-lg-7">
              <h5>Posts</h5>
              <hr/>
              {Object.keys(postsByCurrentUser).length ?
                Object.keys(postsByCurrentUser).map((postKey: string, key: number) => {
                  return <Post 
                  postsData={postsData} 
                  setPostsData={setPostsData} 
                  postKey={postKey} 
                  key={key} 
                  extendedPost={extendedPost}
                  setExtendedPost={setExtendedPost}
                  />
                })
                : <div className="w-100 text-center mb-3"><span className="fs-3 text-muted">No posts to show</span></div>
              }
            </div>
          </div>
        </div>
      </main>
      <footer>
        <Footer />
      </footer>
      {isImageOpen.isOpen && <BigImage options={{hasDelete: true, hasDownload: true, hasUpload: true}} isImageOpen={isImageOpen} setIsImageOpen={setIsImageOpen} />}
    </div>
  );
}

export default CurrentUserProfile;