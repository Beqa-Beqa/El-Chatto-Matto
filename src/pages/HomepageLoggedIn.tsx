import { Footer, HomeContentLoggedIn, NavbarLoggedIn } from "../containers";
import { useState } from "react";

// Homepage for authorized users
const HomepageLoggedIn = () => {
  // state for showing contacts or not.
  const [showContacts, setShowContacts] = useState<boolean>(false);
  const [messagesCount, setMessagesCount] = useState<number>(0);

  return (
    <div className="homepage-logged-in">
      <header>
        <NavbarLoggedIn messagesCount={messagesCount} showContacts={showContacts} setShowContacts={setShowContacts} />
      </header>
      <main>
        <HomeContentLoggedIn setMessagesCount={setMessagesCount} showContacts={showContacts} />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default HomepageLoggedIn;