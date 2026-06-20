import  { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Home = lazy(
  () => import(/* webpackChunkName: "Blogs.Home" */ '@/pages/features/ai-proposal/home')
)

// const Chat = lazy(
//   () => import(/* webpackChunkName: "Blogs.Home" */ '@pages/apps/blogs/home')
// )


export const aiProposalRoutes: RouteObject[] = [
  {
    path: 'ai-proposal',
    children: [
      { index: true, element: <Home /> },
      { path: ':workspace_id/:conversation_id', element: <Home /> },            
    
    ]
  }
]
