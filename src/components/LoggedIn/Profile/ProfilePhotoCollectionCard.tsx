import { useState } from "react";
import BigImage from "./BigImage";

const ProfilePhotoCollectionCard = (props: {isOwner: boolean, src: string, alt: string, type: string}) => {
  const [isImageOpen, setIsImageOpen] = useState<{isOpen: boolean, imageSrc: string, type: string}>({isOpen: false, imageSrc: "", type: ""});

  return (
    <div className="col-xxl-4 col-lg-6 col-md-4 col-6">
      <div onClick={() => setIsImageOpen({isOpen: true, imageSrc: props.src, type: props.type})} style={{height: 200, backgroundColor: "black"}} className="rounded overflow-hidden d-flex align-items-center justify-content-center cursor-pointer">
        <img className="photo-collection-image object-fit-contain w-100" src={props.src} alt={props.alt} />
      </div>
      {isImageOpen.isOpen && 
        <BigImage 
          options={ props.isOwner ? 
            {hasDelete: true, hasUpload: false, hasDownload: true, hasCoverUpload: props.type === "cover", hasProfileUpload: props.type === "profile"}
          : {hasDelete: false, hasUpload: false, hasDownload: true}
          } isImageOpen={isImageOpen} setIsImageOpen={setIsImageOpen} 
        />
      }
    </div>
  );
}

export default ProfilePhotoCollectionCard;