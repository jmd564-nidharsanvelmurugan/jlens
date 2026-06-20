import  { Suspense, lazy } from 'react'
import { useRoutes } from 'react-router-dom'
// import Loading from '@vezham/ui/dist/organisms/loading'
import Loading from "@/components/loader"

import {authRoutes} from './auth'
import { appRoutes } from './apps'

export const AppRoutes = {
  Home: '/',
  Login: '/login',
  AppShell: '/app',
  Blogs: '/app/blogs',
  Store: '/app/store',
  Settings: '/app/settings',
  NotFound: '/not-found',
  MCPServer: '/app/mcp-server',
} as const

export type AppRoutes = (typeof AppRoutes)[keyof typeof AppRoutes]


const NotFound = lazy(() =>
  import('@/components/nfound')
)

export const Routers = () => {

  const routes = useRoutes([
    ...authRoutes,
    ...appRoutes,
    {
      path: '*',
      element: (
        <NotFound />
      )
    }
  ])

  return <Suspense fallback={<Loading />}>{routes}</Suspense>
}
