import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContextProvider from './contexts/AuthContextProvider.tsx'
import GeneralContextProvider from './contexts/GeneralContextProvider.tsx'
import { RemoteUserContextProvider, UserChatsContextProvider } from './contexts'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <React.StrictMode>
      <AuthContextProvider>
        <UserChatsContextProvider>
          <RemoteUserContextProvider >
            <GeneralContextProvider>
              <App />
            </GeneralContextProvider>
          </RemoteUserContextProvider>
        </UserChatsContextProvider>
      </AuthContextProvider>
    </React.StrictMode>
  </BrowserRouter>
)
