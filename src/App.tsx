import "./styles/main.scss";
import { Register, Login, HomepageLoggedIn, HomepageNotLoggedIn } from "./pages";
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContextProvider";
import { signOut } from "firebase/auth";
import { auth } from "./config/firebase";
import { UserChatsContextProvider } from "./contexts";

function App() {
  const {currentUser, isLoading} = useContext(AuthContext);

  // Protected route wrapper, if user is not logged in and there is no loading state, user is
  // redirected to homepage for not logged in users when trying to access root route.
  const ProtectedRoute = ({children}: any) => {
    if(!currentUser && !isLoading) {
      return <HomepageNotLoggedIn />
    } else {
      return children;
    }
  }

  const ProtectedFromLoggedInRoute = ({children}: any) => {
    if(currentUser && !isLoading) {
      return <Navigate to="/" />
    } else {
      return children;
    }
  }

  if(isLoading) {
    // On loading state show spinning circle instead of content.
    return <div id="spinning-circle" />

  } else if (currentUser && !currentUser?.emailVerified) {
    // If the registration was successful and email is not verified we demand from user to verify an email.
    return <div id="verify-email" className="d-flex flex-column justify-center align-center">
        <p className="text-tertiary fs-3">Please verify the email to continue.</p>
        <button className="button-secondary mt-3" onClick={() => signOut(auth)}>Sign Out</button>
      </div>

  } else {
    // Show content if there is no loading state currently or any email verification request.
    return (
      <Routes>
        <Route path="/">
          <Route index element={
            <ProtectedRoute>
              <UserChatsContextProvider>
                <HomepageLoggedIn />
              </UserChatsContextProvider>
            </ProtectedRoute>
          } />
          <Route index element={<HomepageNotLoggedIn />} />
          <Route path="register" element={
            <ProtectedFromLoggedInRoute>
              <Register />
            </ProtectedFromLoggedInRoute>
          } />
          <Route path="login" element={
            <ProtectedFromLoggedInRoute>
              <Login />
            </ProtectedFromLoggedInRoute>
          } />
        </Route>
      </Routes>
    );
  }
}

export default App;