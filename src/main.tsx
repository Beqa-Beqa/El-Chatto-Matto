import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContextProvider from './contexts/AuthContextProvider.tsx'
import GeneralContextProvider from './contexts/GeneralContextProvider.tsx'
import { UserChatsContextProvider } from './contexts'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <React.StrictMode>
      <AuthContextProvider>
        <UserChatsContextProvider>
          <GeneralContextProvider>
            <App />
          </GeneralContextProvider>
        </UserChatsContextProvider>
      </AuthContextProvider>
    </React.StrictMode>
  </BrowserRouter>
)
