import { useContext } from "react";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";
import { ProfilePhotoCollectionCard } from "../../../components";

const PhotosContainer = (props: {isOwner: boolean}) => {
  const {filteredUserProfileImages} = useContext(RemoteUserContext);

  return (
    <div className="container-fluid">
      <div className="row g-3">
        {
          Object.keys(filteredUserProfileImages).length ?
            Object.keys(filteredUserProfileImages).map((date: string, key: number) => {
              return <ProfilePhotoCollectionCard key={key} isOwner={props.isOwner} src={filteredUserProfileImages[parseInt(date)].url} alt="user image" />
            })
          : 
            <span className="fs-5 text-left text-primary my-4">
              {props.isOwner ? "No photos to show for you" : "No photos to show of this user"}
            </span>
        }
      </div>
    </div>
  );
}

export default PhotosContainer;