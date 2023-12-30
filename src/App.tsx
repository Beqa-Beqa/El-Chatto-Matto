import "./styles/sass/main.scss";
import { Register, Login, HomepageLoggedIn, HomepageNotLoggedIn, Friends, CurrentUserProfile, RemoteUserProfile } from "./pages";
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContextProvider";
import { signOut } from "firebase/auth";
import { auth } from "./config/firebase";
import { Button } from "react-bootstrap";
import { RemoteUserContext } from "./contexts/RemoteUserContextProvider";
import { DocumentData } from "firebase/firestore";

export const deletePrompt = (userName: string, yes: () => void, no: () => void) => <div className="bg-secondary rounded py-2 px-4">
    <span className="fs-5">Delete <strong>{userName}</strong> from your friends?</span>
    <div className="mt-5 d-flex justify-content-center gap-3">
      <button onClick={() => yes()} className="action-button rounded">
        Confirm
      </button>
      <button onClick={() => no()} className="action-button rounded">
        Decline
      </button>
    </div>
  </div>

function App() {
  const {currentUser, isLoading} = useContext(AuthContext);
  const {remUserGenInfo}: DocumentData = useContext(RemoteUserContext);
  // If user is on their profile page isOwner will be true.
  const isOwner = currentUser?.uid === remUserGenInfo.uid;

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
    return <div className="roller-wrapper"><div className="lds-roller"><div/><div/><div/><div/><div/><div/><div/><div/></div></div>

  } else if (currentUser && !currentUser?.emailVerified) {
    // If the registration was successful and email is not verified we demand from user to verify an email.
    return <div id="verify-email" className="d-flex flex-column justify-center align-center">
        <div className="bg-image" />
        <div className="bg-color" />
        <div className="verify-email-content w-100 h-100 d-flex flex-column justify-content-center align-items-center">
          <p className="text-center text-secondary fs-3">Please verify the email to continue.</p>
          <Button className="mt-3" variant="outline-secondary" onClick={() => signOut(auth)}>Sign Out</Button>
        </div>
      </div>

  } else {
    // Show content if there is no loading state currently or any email verification request.
    return (
      <Routes>
        <Route path="/">
          <Route index element={
            <ProtectedRoute>
              <HomepageLoggedIn />
            </ProtectedRoute>
          } />
          <Route path="/friends" element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          } />
          <Route path={`/${remUserGenInfo.uid}`} element={
            <ProtectedRoute>
              {isOwner ? <CurrentUserProfile /> : <RemoteUserProfile />}
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