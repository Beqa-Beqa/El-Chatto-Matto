import { useState } from "react";
import BigImage from "./BigImage";

const ProfilePhotoCollectionCard = (props: {src: string, alt: string}) => {
  const [isImageOpen, setIsImageOpen] = useState<{isOpen: boolean, imageSrc: string, type: string}>({isOpen: false, imageSrc: "", type: ""});

  return (
    <div className="col-xxl-3 col-lg-4 col-sm-6 col-12">
      <div className="bg-primary rounded overflow-hidden h-100 d-flex align-items-center justify-content-center">
        <img onClick={(e) => {
          const imageSrc = (e.target as HTMLImageElement).src;
          setIsImageOpen({isOpen: true, imageSrc: imageSrc, type: "profile"});
        }} className="photo-collection-image cursor-pointer object-fit-contain w-100" src={props.src} alt={props.alt} />
      </div>
      {isImageOpen.isOpen && <BigImage options={{hasDelete: true, hasUpload: false, hasDownload: true}} isImageOpen={isImageOpen} setIsImageOpen={setIsImageOpen} />}
    </div>
  );
}

export default ProfilePhotoCollectionCard;