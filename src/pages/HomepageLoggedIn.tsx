import { Footer, HomeContentLoggedIn, NavbarLoggedIn } from "../containers";

// Homepage for authorized users
const HomepageLoggedIn = () => {
  return (
    <div className="homepage-logged-in">
      <header>
        <NavbarLoggedIn />
      </header>
      <main>
        <HomeContentLoggedIn />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default HomepageLoggedIn;