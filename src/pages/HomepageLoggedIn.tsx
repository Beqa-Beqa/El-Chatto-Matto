import { MessagingWindow, Navbar } from "../containers";

// Homepage for authorized users
const HomepageLoggedIn = () => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className="d-flex align-center justify-center mt-5">
        <MessagingWindow />
      </main>
    </>
  );
}

export default HomepageLoggedIn;