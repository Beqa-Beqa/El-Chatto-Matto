import { Contacts } from "../../components";

const HomeContentLoggedIn = () => {
  return(
    <div className="home-content-logged-in pt-5 ps-5 mt-4 w-100 h-100">
      <div className="w-100 d-flex justify-content-between">
        {/* <Content /> */}
        <Contacts className="position-fixed end-0" />
      </div>
    </div>
  );
}

export default HomeContentLoggedIn;