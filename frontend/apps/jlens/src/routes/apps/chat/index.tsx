import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'


const Home = lazy(() => import('@/pages/features/chat/home'))

export const chatRoutes: RouteObject[] = [
  {
    path: 'chat',
    children: [
      { index: true, element: <Home /> },                      
      { path: ':workspace_id/:conversation_id', element: <Home /> },            
    ]
  }
]
