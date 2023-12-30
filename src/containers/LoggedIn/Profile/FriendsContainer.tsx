import { useContext } from "react";
import { UserChatsContext } from "../../../contexts/UserChatsContextProvider";
import { DocumentData } from "firebase/firestore";
import { UserCard } from "../../../components";


const FriendsContainer = (props: {isOwner: boolean}) => {
  const {friendsData} = useContext(UserChatsContext);

  if(props.isOwner) {
    return <div className="container-fluid">
      <div className="row g-3">
        { friendsData.length ?
            friendsData.map((data: DocumentData | undefined, key: number) => {
              return <UserCard userData={data!} key={key} />
            })
          : <span className="fs-5 text-center text-primary my-4">You currently do not have any friends on El Chatto Matto.</span>
        }
      </div>
    </div>
  } else {
    return <div>
      adasdasa
    </div>
  }
}

export default FriendsContainer;