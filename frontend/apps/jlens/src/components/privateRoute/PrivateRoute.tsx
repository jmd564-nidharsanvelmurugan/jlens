// src/components/PrivateRoute.tsx
import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  // Check if user has email in sessionStorage (set after successful login)
  // Actual auth is verified by HTTP-only cookie on each API request
  const email = sessionStorage.getItem('email')
  return email ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
