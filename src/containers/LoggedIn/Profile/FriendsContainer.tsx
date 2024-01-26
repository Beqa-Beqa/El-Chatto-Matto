import { useContext } from "react";
import { UserChatsContext } from "../../../contexts/UserChatsContextProvider";
import { DocumentData } from "firebase/firestore";
import { UserCard } from "../../../components";
import { RemoteUserContext } from "../../../contexts/RemoteUserContextProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";


const FriendsContainer = (props: {isOwner: boolean, friendsPage: boolean, filterBySearch?: string}) => {
  const {friendsData, friends} = useContext(UserChatsContext);
  const {remUserGenInfo, remUserUserChatsInfo} = useContext(RemoteUserContext);

  const navigate = useNavigate();

  if(props.isOwner && props.friendsPage) {
    return <div className="mb-5 mb-md-0">
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
  } else if (props.isOwner && !props.friendsPage) {
    let keyRef = 0;

    return <div className="mb-5 mb-md-0">
        { friendsData.length ?
            <>
              <div className="row g-3">
                {friendsData.map((data: DocumentData | undefined, key: number) => {
                  if(props.filterBySearch) {
                    return data!.searchArray.includes(props.filterBySearch) && <UserCard userData={data!} key={key} />
                  }
                  keyRef++;
                  return keyRef <= 6 && <UserCard userData={data!} key={key} />
                })}
              </div>
              {keyRef > 6 && <Button onClick={() => navigate("/friends")} variant="outline-primary" className="w-100 mt-2 rounded">See more</Button>}
            </>
          : <span className="fs-5 text-left text-primary my-4">You currently do not have any friends on El Chatto Matto.</span>
        }
      </div>
  } 
  else {
    let keyRef = 0;

    return <div className="mb-5 mb-md-0">
      <div className="row g-3">
          { friends.filter((friend: string) => remUserUserChatsInfo.friends && remUserUserChatsInfo.friends.includes(friend)).length ?  
              remUserUserChatsInfo.friends.length &&
              <>
                {friendsData.map((data: DocumentData | undefined, key: number) => {
                  if(remUserUserChatsInfo.friends.includes(data!.uid)) {
                    keyRef++;
                    return keyRef <= 6 && <UserCard userData={data!} key={key} />
                  }
                })}
                {keyRef > 6 && <Button variant="outline-primary" className="w-100 mt-2 rounded">See more</Button>}
              </>
            :
            <span className="fs-5 text-left text-primary my-4">You do not have any mutual friends with {remUserGenInfo.displayName}</span>
          }
      </div>
    </div>
  }
}

export default FriendsContainer;