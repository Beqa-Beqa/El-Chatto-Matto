import { HomeContentNotLoggedIn, NavbarNotLoggedIn } from "../containers";
import { NotLoggedInSlider } from "../containers";

// This is homepage for unauthorized users.
const HomepageNotLoggedIn = () => {
  return (
    <>
      <header>
        <NavbarNotLoggedIn />
      </header>
      <main>
        <HomeContentNotLoggedIn />
        <NotLoggedInSlider />
      </main>
      <footer>

      </footer>
    </>
  );
}

export default HomepageNotLoggedIn;