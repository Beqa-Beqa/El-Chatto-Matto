import { useContext } from "react";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";
import { ProfilePhotoCollectionCard } from "../../../components";
import { Button } from "react-bootstrap";

const PhotosContainer = (props: {isOwner: boolean}) => {
  const {filteredUserProfileImages} = useContext(RemoteUserContext);
  let keyRef = 0;
  return (
    <div className="mb-5 mb-md-0">
      <>
        {
          Object.keys(filteredUserProfileImages).length ?
            <>
              <div className="row g-3">
                {Object.keys(filteredUserProfileImages).map((date: string, key: number) => {
                  keyRef++;
                  return keyRef <= 6 && <ProfilePhotoCollectionCard key={key} isOwner={props.isOwner} src={filteredUserProfileImages[parseInt(date)].url} alt="user image" />
                })}
              </div>
              {keyRef > 6 && <Button variant="outline-primary" className="w-100 mt-2 rounded">See more</Button>}
            </>
          : 
            <span className="fs-5 text-left text-primary my-4">
              {props.isOwner ? "No photos to show for you" : "No photos to show of this user"}
            </span>
        }
      </>
    </div>
  );
}

export default PhotosContainer;