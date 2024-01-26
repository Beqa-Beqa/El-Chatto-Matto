import { Footer, HomeContentLoggedIn, NavbarLoggedIn } from "../containers";
import { useState } from "react";

// Homepage for authorized users
const HomepageLoggedIn = () => {
  // state for showing contacts or not.
  const [showContacts, setShowContacts] = useState<boolean>(false);

  return (
    <div className="homepage-logged-in">
      <header>
        <NavbarLoggedIn showContacts={showContacts} setShowContacts={setShowContacts} />
      </header>
      <main>
        <HomeContentLoggedIn showContacts={showContacts} />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default HomepageLoggedIn;