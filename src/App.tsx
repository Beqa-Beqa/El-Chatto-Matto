import "./styles/main.scss";
import { Register, Login, HomepageLoggedIn, HomepageNotLoggedIn } from "./pages";
import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContextProvider";
import { signOut } from "firebase/auth";
import { auth } from "./config/firebase";

function App() {
  const {currentUser, isLoading} = useContext(AuthContext);

  const ProtectedRoute = ({children}: any) => {
    if(!currentUser && !isLoading) {
      return <HomepageNotLoggedIn />
    } else {
      return children;
    }
  }

  if(isLoading) {

    return <div id="spinning-circle" />

  } else if (currentUser && !currentUser?.emailVerified) {

    return <div id="verify-email" className="d-flex flex-column justify-center align-center">
        <p className="text-tertiary fs-3">Please verify the email to continue.</p>
        <button className="button-secondary mt-3" onClick={() => signOut(auth)}>Sign Out</button>
      </div>

  } else {
    
    return (
      <Routes>
        <Route path="/">
          <Route index element={
            <ProtectedRoute>
              <HomepageLoggedIn />
            </ProtectedRoute>
          } />
          <Route index element={<HomepageNotLoggedIn />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    );
  }
}

export default App;