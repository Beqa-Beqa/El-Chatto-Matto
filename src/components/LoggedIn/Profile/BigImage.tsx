import { handleImageDelete, handleImageUpload } from "../../../functions/firebase";
import { firestore, storage } from "../../../config/firebase";
import { DocumentData, doc, updateDoc } from "firebase/firestore";
import { MdClose, MdDownload, MdUpload, MdDelete } from "react-icons/md";
import { imageDownload } from "../../../functions/general";
import { User } from "firebase/auth";
import { useContext } from "react";
import { GeneralContext } from "../../../contexts/GeneralContextProvider";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";
import { AuthContext } from "../../../contexts/AuthContextProvider";

// Handle upload of user image.
export const userImageUpload = async (type: string, image: File | null, currentUser: User, remUserGenInfo: DocumentData) => {
    // Current user document reference.
    const currentUserDocRef = doc(firestore, "users", currentUser!.uid);
    // Check out functions/firebase.ts for detailed info about handleImageUpload.
    const uploadResult = await handleImageUpload(firestore, storage, currentUser!)(type, image, {returnRefAndUpload: true, returnURLAndUpload: true});
    // If we have info existing already then we need it in order to update document without data loss.
    const existingInfo = type === "profile" ? remUserGenInfo.profileImageRefs : type === "cover" ? remUserGenInfo.coverImageRefs : {} || {};
    // Create update chunk.
    const updateChunk: any = {...existingInfo};
    updateChunk[`${uploadResult?.url}`] = {
      ref: uploadResult?.ref,
      date: new Date().getTime()
    };
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

  // Handle delete of user image.
export const userImageDelete = async (type: string, dwUrl: string, currentUser: User,remUserGenInfo: DocumentData) => {
    // Updated object that will be sent to updateDoc.
    const newValueToSend: any = {...remUserGenInfo[`${type}ImageRefs`]};
    // See functions/firebase.ts for detailed info about handleImageDelete.
    await handleImageDelete(firestore, storage, remUserGenInfo,currentUser!, dwUrl, type);
    // Update chunk that will be sent to updateDoc.
    delete newValueToSend[`${dwUrl}`];
    const updateChunk: any = {}
    updateChunk[`${type}ImageRefs`] = newValueToSend;
    // Current user document reference.
    const currentUserDocRef = doc(firestore, "users", currentUser!.uid);
    await updateDoc(currentUserDocRef, updateChunk);
}

const BigImage = (props: {
  isImageOpen: {imageSrc: string, type: string},
  setIsImageOpen: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    imageSrc: string;
    type: string;
  }>>,
  options?: {
    hasDelete?: boolean,
    hasUpload?: boolean,
    hasDownload?: boolean
  }
}) => {
  const {currentUser} = useContext(AuthContext);
  const {width} = useContext(GeneralContext);
  const {setTrigger, remUserGenInfo} = useContext(RemoteUserContext);
  const imageStyles = width > 768 ? "w-50 h-50" : "w-75 h-75";

  return (
   <div className="user-prompt">
    <div className={`${imageStyles} d-flex flex-column align-items-center justify-content-center`}>
      <div className="d-flex justify-content-end w-100 mb-2 gap-2">
        {props.options &&
          props.options.hasDelete && <div onClick={async () => {
          const dwUrl = props.isImageOpen.imageSrc;
          props.setIsImageOpen(prev => {return {isOpen: false, imageSrc: prev.imageSrc, type: prev.type}});
          await userImageDelete(props.isImageOpen.type, dwUrl, currentUser!, remUserGenInfo);
          setTrigger(prev => !prev);
        }} className="image-navbar-icon p-0 m-0 text-primary">
          <span className="custom-tooltip">Delete Image</span>
          <MdDelete />
        </div>}

        {props.options &&
          props.options.hasUpload && <><label htmlFor="upload-input">
          <div className="image-navbar-icon p-0 m-0 text-primary">
            <span className="custom-tooltip">Upload Image</span>
            <MdUpload />
          </div>
        </label>

        <input id="upload-input" onChange={async (e) => {
          const image = e.target.files ? e.target.files[0] : null;
          props.setIsImageOpen(prev => {return {isOpen: false, imageSrc: "", type: prev.type}});
          await userImageUpload(props.isImageOpen.type, image, currentUser!, remUserGenInfo);
          setTrigger(prev => !prev);
        }} hidden type="file"/></>}

        {props.options &&
          props.options.hasDownload && <div onClick={async () => {
          const dwUrl = props.isImageOpen.imageSrc;
          props.setIsImageOpen(prev => {return {isOpen: false, imageSrc: prev.imageSrc, type: prev.type}});
          await imageDownload(dwUrl, `${remUserGenInfo.displayName}-${props.isImageOpen.type}-image`);
        }} className="image-navbar-icon p-0 m-0 text-primary">
          <span className="custom-tooltip">Download Image</span>
          <MdDownload />
        </div>}

        <div onClick={() => props.setIsImageOpen({isOpen: false, imageSrc: "", type: ""})} className="image-navbar-icon p-0 m-0 text-primary">
          <span className="custom-tooltip mb-5">Close Image</span>
          <MdClose />
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-center" style={{maxHeight: "90vh", maxWidth:"90vw"}}>
        <img className="h-100 w-100 rounded" src={props.isImageOpen.imageSrc} alt="user image" />
      </div>
    </div>
  </div>
  );
}

export default BigImage;