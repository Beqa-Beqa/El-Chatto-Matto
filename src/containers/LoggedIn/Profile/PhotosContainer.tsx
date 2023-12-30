import { useContext } from "react";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";
import { ProfilePhotoCollectionCard } from "../../../components";

const PhotosContainer = (props: {isOwner: boolean}) => {
  const {filteredUserProfileImages} = useContext(RemoteUserContext);

  return (
    <div className="container-fluid">
      <div className="row g-3">
        {props.isOwner ?
          Object.keys(filteredUserProfileImages).length ?
            Object.keys(filteredUserProfileImages).map((date: string, key: number) => {
              return <ProfilePhotoCollectionCard key={key} src={filteredUserProfileImages[parseInt(date)].url} alt="user image" />
            })
          : <span className="fs-5 text-center text-primary my-4">No photos to show for you.</span>
        :
          <span>ASDASDAUIOFHQOASUHEQUIAOWHSEDOi</span>
        }
      </div>
    </div>
  );
}

export default PhotosContainer;