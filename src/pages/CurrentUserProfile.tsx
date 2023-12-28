import { useContext, useState } from "react";
import { RemoteUserContext } from "../contexts/RemoteUserContextProvider";
import { Camera } from "../assets/images";
import { GeneralContext } from "../contexts/GeneralContextProvider";
import { Footer, NavbarLoggedIn } from "../containers";
import { AuthContext } from "../contexts/AuthContextProvider";
import { handleImageDelete, handleImageUpload } from "../functions/firebase";
import { firestore, storage } from "../config/firebase";
import { DocumentData, deleteField, doc, updateDoc } from "firebase/firestore";
import { UserCard } from "../components";
import { UserChatsContext } from "../contexts/UserChatsContextProvider";
import { MdClose, MdDownload, MdUpload, MdDelete } from "react-icons/md";
import { imageDownload } from "../functions/general";

const CurrentUserProfile = () => {
  // Current user.
  const {currentUser} = useContext(AuthContext);
  // Info about remote user on whose profile we are.
  const {remUserGenInfo, remUserUserChatsInfo} = useContext(RemoteUserContext);
  // With of window.
  const {width} = useContext(GeneralContext);
  // Friends data for current user.
  const {friendsData} = useContext(UserChatsContext);
  // Type of image (cover or profile)
  const [imageType, setImageType] = useState<string>("");
  // State for checking if image is open or not.
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);

  // Dynamic styles for profile image container.
  const profileImageContainerStyles = width > 574 ? {top: -60} : {top: -30};
  // Dynamic styles for profile image.
  const profileImageStyles = width > 574 ? {width: 150, height: 150, top: -60} : {width: 100, height: 100, top: -30};

  // Handle delete of user image.
  const userImageDelete = async (type: string, dwUrl: string) => {
    // Updated object that will be sent to updateDoc.
    const updatedValue: any = {...remUserGenInfo[`${type}ImageRefs`]};
    // Set storageRef.
    const storageRef = updatedValue[`${dwUrl}`];
    // See functions/firebase.ts for detailed info about handleImageDelete.
    await handleImageDelete(firestore, storage, currentUser!, storageRef, type);
    // Current user document reference.
    const currentUserDocRef = doc(firestore, "users", currentUser!.uid);
    // Delete image reference from document.
    updatedValue[`${dwUrl}`] = deleteField();
    // Update document.
    const updateChunk: any = {};
    updateChunk[`${type}ImageRefs`] = updatedValue;
    await updateDoc(currentUserDocRef, updateChunk);
  }

  // Handle upload of user image.
  const userImageUpload = async (type: string, image: File | null) => {
    // Current user document reference.
    const currentUserDocRef = doc(firestore, "users", currentUser!.uid);
    // Check out functions/firebase.ts for detailed info about handleImageUpload.
    const uploadResult = await handleImageUpload(firestore, storage, currentUser!)(type, image, {returnRefAndUpload: true, returnURLAndUpload: true});
    // If we have info existing already then we need it in order to update document without data loss.
    const existingInfo = type === "profile" ? remUserGenInfo.profileImageRefs : type === "cover" ? remUserGenInfo.coverImageRefs : {} || {};
    // Create update chunk.
    const updateChunk: any = {...existingInfo};
    updateChunk[`${uploadResult?.url}`] = uploadResult?.ref;
    if(type === "profile") {
      // If type is profile, set profile image references to update chunk.
      await updateDoc(currentUserDocRef, {
        profileImageRefs: updateChunk
      });

    } else if (type === "cover") {
      // If type is cover, set cover image references to update chunk.
      await updateDoc(currentUserDocRef, {
        coverImageRefs: updateChunk
      })
    }
  }

  const imageStyles = width > 768 ? "w-50 h-50" : "w-75 h-75";

  const biggerImage = <div className="user-prompt">
    <div className={`${imageStyles} d-flex flex-column align-items-center justify-content-center`}>
      <div className="d-flex justify-content-end w-100 mb-2 gap-2">
        <div onClick={() => {
          const dwUrl = remUserGenInfo[`${imageType === "profile" ? "photo" : "cover"}URL`];
          userImageDelete(imageType, dwUrl);
          setIsImageOpen(false);
        }} className="image-navbar-icon p-0 m-0 text-primary">
          <MdDelete />
        </div>

        <label htmlFor="upload-input">
          <div className="image-navbar-icon p-0 m-0 text-primary">
            <MdUpload />
          </div>
        </label>

        <input id="upload-input" onChange={async (e) => {
          const image = e.target.files ? e.target.files[0] : null;
          await userImageUpload(imageType, image);
          setIsImageOpen(false);
        }} hidden type="file" />

        <div onClick={async () => {
          const dwUrl = remUserGenInfo[`${imageType === "profile" ? "photo" : "cover"}URL`];
          await imageDownload(dwUrl, `${imageType}-image`);
          setIsImageOpen(false);
        }} className="image-navbar-icon p-0 m-0 text-primary"><MdDownload /></div>

        <div onClick={() => setIsImageOpen(false)} className="image-navbar-icon p-0 m-0 text-primary"><MdClose /></div>
      </div>
      <img className="w-100 rounded" src={imageType === "profile" ? remUserGenInfo.photoURL : remUserGenInfo.coverURL} alt="user image" />
    </div>
  </div>

  return (
    <div className="profile-page">
      <header>
        <NavbarLoggedIn />
      </header>
      <main>
        <div className="user-profile px-2 pt-5 mt-4">
          <div className={`cover-${remUserGenInfo.coverURL ? "user" : "placeholder"}-image h-100 w-100 d-flex justify-content-center align-items-end rounded`}>
            <div className="image-container">
              <img onClick={() => {setImageType("cover"); setIsImageOpen(true);}} src={remUserGenInfo.coverURL || Camera} alt="placeholder camera" />
            </div>
          </div>
          <div className="profile-image-container w-100 d-flex flex-column justify-content-center align-items-center">
            <div style={profileImageContainerStyles} className="d-flex flex-column w-100 h-100 align-items-center position-relative">
              <img onClick={() => {
                  {setImageType("profile"); setIsImageOpen(true);}
                }} style={profileImageStyles} className="rounded-circle cursor-pointer object-fit-cover" src={remUserGenInfo.photoURL} alt="user" />
              <h3 className="text-primary mt-2">{remUserGenInfo.displayName}</h3>
            </div>
            <span style={{...profileImageContainerStyles, maxWidth: 500}} className="position-relative text-center w-100">Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga corporis sint earum nemo, impedit tempora fugit quis sit iusto quo nihil, autem deleniti eum eaque quae esse. Sed, labore eligendi.</span>
            <div style={profileImageContainerStyles} className="d-flex justify-content-center position-relative mt-3">
              <span className="fs-5">{remUserUserChatsInfo.friends.length} Friends</span>
              <hr style={{width: 20, transform: "rotate(90deg)"}} className="mx-2"/>
              <span className="fs-5">0 Posts</span>
            </div>
          </div>
          <div className="profile-friends mb-4">
            <h5>Friends</h5>
            <hr/>
            <div className="container-fluid">
              <div className="row g-3">
                { friendsData.length ?
                    friendsData.map((data: DocumentData | undefined, key: number) => {
                      return <UserCard userData={data!} key={key} />
                    })
                  : <span className="fs-5 text-center text-primary my-4">You currently do not have any friends on El Chatto Matto.</span>
                }
              </div>
            </div>
          </div>
          adsasdadsadsasd
          <hr />
        </div>
      </main>
      <footer>
        <Footer />
      </footer>
      {isImageOpen && biggerImage}
    </div>
  );
}

export default CurrentUserProfile;