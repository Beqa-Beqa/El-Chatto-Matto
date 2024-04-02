import { Footer, NavbarLoggedIn, PhotosContainer } from "../containers";

const Photos = (props: {isOwner: boolean}) => {
  return (
    <div className="profile-page">
      <header>
        <NavbarLoggedIn />
      </header>
      <main className="home-content-logged-in mt-5 pt-5 px-md-5 px-sm-4 px-2 w-100 d-flex flex-column text-primary">
        <div className="profile-photos mb-4">
          <h5>Cover Photos</h5>
          <hr />
          <PhotosContainer type="cover" isOwner={props.isOwner} imagesPage/>
        </div>
        <div className="profile-photos mb-4">
          <h5>Profile Photos</h5>
          <hr />
          <PhotosContainer type="profile" isOwner={props.isOwner} imagesPage/>
        </div>
      </main>
      <footer>
        <Footer /> 
      </footer>
    </div>
  );
}

export default Photos;