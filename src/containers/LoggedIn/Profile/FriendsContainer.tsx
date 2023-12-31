import { useContext } from "react";
import { UserChatsContext } from "../../../contexts/UserChatsContextProvider";
import { DocumentData } from "firebase/firestore";
import { UserCard } from "../../../components";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";


const FriendsContainer = (props: {isOwner: boolean, filterBySearch?: string}) => {
  const {friendsData, friends} = useContext(UserChatsContext);
  const {remUserGenInfo, remUserUserChatsInfo} = useContext(RemoteUserContext);

  if(props.isOwner) {
    return <div className="container-fluid mb-5 mb-md-0">
      <div className="row g-3">
        { friendsData.length ?
            friendsData.map((data: DocumentData | undefined, key: number) => {
              if(props.filterBySearch) {
                return data!.searchArray.includes(props.filterBySearch) && <UserCard userData={data!} key={key} />
              }
              return <UserCard userData={data!} key={key} />
            })
          : <span className="fs-5 text-left text-primary my-4">You currently do not have any friends on El Chatto Matto.</span>
        }
      </div>
    </div>
  } else {
    return <div className="container-fluid mb-5 mb-md-0">
      <div className="row g-3">
        { friends.filter((friend: string) => remUserUserChatsInfo.friends && remUserUserChatsInfo.friends.includes(friend)).length ?  
            remUserUserChatsInfo.friends.length &&
              friendsData.map((data: DocumentData | undefined, key: number) => {
                if(remUserUserChatsInfo.friends.includes(data!.uid)) {
                  return <UserCard userData={data!} key={key} />
                }
              })
          :
          <span className="fs-5 text-left text-primary my-4">You do not have any mutual friends with {remUserGenInfo.displayName}</span>
        }
      </div>
    </div>
  }
}

export default FriendsContainer;