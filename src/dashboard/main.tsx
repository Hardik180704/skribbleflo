import React from 'react'
import ReactDOM from 'react-dom/client'
import Dashboard from './Dashboard'
import { AuthProvider } from '../lib/auth'
import '../index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  </React.StrictMode>,
)
