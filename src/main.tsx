import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContextProvider from './contexts/AuthContextProvider.tsx'
import GeneralContextProvider from './contexts/GeneralContextProvider.tsx'
import { RemoteUserContextProvider, UserChatsContextProvider } from './contexts'
import MessagesContextProvider from './contexts/MessagesContextProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <React.StrictMode>
      <AuthContextProvider>
        <UserChatsContextProvider>
          <MessagesContextProvider>
            <RemoteUserContextProvider >
              <GeneralContextProvider>
                <App />
              </GeneralContextProvider>
            </RemoteUserContextProvider>
          </MessagesContextProvider>
        </UserChatsContextProvider>
      </AuthContextProvider>
    </React.StrictMode>
  </BrowserRouter>
)
