import { useContext, useState } from "react";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";
import { ProfilePhotoCollectionCard } from "../../../components";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PhotosContainer = (props: {
  isOwner: boolean,
  type: string,
  imagesPage: boolean
}) => {
  const {filteredUserProfileImages, filteredUserCoverImages, remUserGenInfo} = useContext(RemoteUserContext);
  const navigate = useNavigate();

  const [keyLimit, setKeyLimit] = useState<number>(6);
  let keyRef = 0;

  const handlSeeMore = () => {
    !props.imagesPage ? navigate(`/${remUserGenInfo.uid}/images`) : setKeyLimit(keyLimit + 6);
  }

  return (
    <div className="mb-5 mb-md-0">
      <>
        {props.type === "profile" ?
          Object.keys(filteredUserProfileImages).length ?
            <>
              <div className="row g-3">
                {Object.keys(filteredUserProfileImages).map((date: string, key: number) => {
                  keyRef++;
                  return keyRef <= keyLimit && <ProfilePhotoCollectionCard type={props.type} key={key} isOwner={props.isOwner} src={filteredUserProfileImages[date] && filteredUserProfileImages[date].url} alt="user image" />
                })}
              </div>
              {keyRef > keyLimit && <Button onClick={handlSeeMore} variant="outline-primary" className="w-100 mt-2 rounded">See more</Button>}
            </>
          : 
            <span className="fs-5 text-left text-primary my-4">
              {props.isOwner ? "No photos to show for you" : "No photos to show of this user"}
            </span>
        :
          Object.keys(filteredUserCoverImages).length ?
            <>
              <div className="row g-3">
                {Object.keys(filteredUserCoverImages).map((date: string, key: number) => {
                  keyRef++;
                  return keyRef <= keyLimit && <ProfilePhotoCollectionCard type={props.type} key={key} isOwner={props.isOwner} src={filteredUserCoverImages[date] && filteredUserCoverImages[date].url} alt="user image" />
                })}
              </div>
              {keyRef > keyLimit && <Button onClick={handlSeeMore} variant="outline-primary" className="w-100 mt-2 rounded">See more</Button>}
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