import  { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Home = lazy(
  () => import(/* webpackChunkName: "Blogs.Home" */ '@/pages/features/self-analytics/home')
)

// const Chat = lazy(
//   () => import(/* webpackChunkName: "Blogs.Home" */ '@pages/apps/blogs/home')
// )

export const selfAnalyticsRoutes: RouteObject[] = [
  {
    path: 'self-analytics',
    children: [
      { index: true, element: <Home /> },
    //   { path: 'folders/:folderId', element: <Chat /> },
    
    ]
  }
]
