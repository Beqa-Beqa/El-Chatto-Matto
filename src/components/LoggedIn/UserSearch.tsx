import { useEffect, useContext } from "react";
import { firestore } from "../../config/firebase";
import { DocumentData, collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { filterUsername } from "../../functions";
import { IoMdClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { GeneralContext } from "../../contexts/GeneralContextProvider";

const UserSearch = (props: {
  className?: string,
  userName: string,
  setUserName: React.Dispatch<React.SetStateAction<string>>,
  userData: DocumentData[],
  setUserData: React.Dispatch<React.SetStateAction<DocumentData[]>>,
  showInput: boolean,
  setShowInput: React.Dispatch<React.SetStateAction<boolean>>,
  showClose: boolean,
  setShowClose: React.Dispatch<React.SetStateAction<boolean>>
}) => {

  // Context for getting information about current user.
  const {currentUser} = useContext(AuthContext);
  const {width} = useContext(GeneralContext);

  const getUserData = async () => {
    if(props.userName) {
      // Collection refference and creating AND query.
      const colRef = collection(firestore, "users");
      const qry = query(
        colRef,
        where("searchArray", "array-contains", filterUsername(props.userName)),
        where("uid", "!=", currentUser?.uid)
      );
    
      try {
        // Temporary array to store information.
        const temporarArr: any = [];
        // snapshot encapsulates all the data retrieved from query (qry) request.
        const snapshot = await getDocs(qry);
        // Loop through encapsulated data and store them in temporary array.
        // Retrieve data with doc.data().
        snapshot.forEach((doc) => {
          temporarArr.push(doc.data());
        });
        // Update state so that data will be avaliable through this component globally.
        props.setUserData(temporarArr);
      } catch (err) {
        // Any errors? log them. :]
        console.error(err);
      }
    } else {
      props.setUserData([]);
    }
  }

  // Useffect calls getUserData anytime when username for search field changes.
  useEffect(() => {
    getUserData();
  }, [props.userName]);

  return (
    <div className={`${props.className} d-flex align-items-center`}>
      {width > 574 || props.showInput ? <input placeholder="Find users" className="border-0 px-1" type="text" onChange={(e) => {
        props.setUserName(e.target.value)
        props.setShowClose(true);
      }} value={props.userName} />
      :
      <CiSearch className="navbar-icon" onClick={() => {
          props.setShowInput(true)
          props.setShowClose(true)
        }} 
      />}
      {props.showClose && <IoMdClose onClick={() => {
        props.setUserName("")
        props.setShowInput(false)
        props.setShowClose(false)
      }} className="ms-1 navbar-icon" />}
    </div>
  );
}

export default UserSearch;