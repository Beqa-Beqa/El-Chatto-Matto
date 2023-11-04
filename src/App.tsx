import "./styles/main.scss";
import { Register, Login, HomepageLoggedIn, HomepageNotLoggedIn } from "./pages";
import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContextProvider";

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

    return <div id="spinningCircle" />

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