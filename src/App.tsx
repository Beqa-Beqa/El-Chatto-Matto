import "./styles/sass/main.scss";
import { Register, Login, HomepageLoggedIn, HomepageNotLoggedIn, Friends } from "./pages";
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContextProvider";
import { signOut } from "firebase/auth";
import { auth } from "./config/firebase";
import { Button } from "react-bootstrap";

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
    return <div className="roller-wrapper"><div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>

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