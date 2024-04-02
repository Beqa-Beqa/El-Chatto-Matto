import { useContext } from "react";
import { Contacts, Content } from "../../components";
import { GeneralContext } from "../../contexts/GeneralContextProvider";

const HomeContentLoggedIn = (props: {
  showContacts?: boolean,
  setMessagesCount?: React.Dispatch<React.SetStateAction<number>>
}) => {
  const {width} = useContext(GeneralContext);

  return(
    <div className="home-content-logged-in pt-3 mt-5 w-100 h-100">
      <div className="w-100 d-flex justify-content-center">
        <Content />
        {width >= 992 && <div style={{width: 300, position: "relative", zIndex: -100}} />}
        <Contacts setMessagesCount={props.setMessagesCount} showContacts={props.showContacts} />
      </div>
    </div>
  );
}

export default HomeContentLoggedIn;