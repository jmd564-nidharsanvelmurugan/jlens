import  { lazy } from 'react'
import { Navigate } from 'react-router-dom'


const Home = lazy(() => import('@/pages/home'))
const MicrosoftAuthHandler = lazy(() => import('@/auth/microsoft-auth-handler'))

export const authRoutes = [
  {
    path: '/',
    element: <Navigate to="/login" />
  },
  {
    path: '/login',
    element: <Home />
  },
  {
    path: '/auth/callback',
    element: <MicrosoftAuthHandler />
  }
]
