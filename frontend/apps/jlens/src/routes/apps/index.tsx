import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

import { chatRoutes } from './chat'
import { aiProposalRoutes } from './ai-proposal'
import { selfAnalyticsRoutes } from './self-analytics'
import PrivateRoute from '@/components/privateRoute/PrivateRoute'
import AdminRoute from '@/components/privateRoute/AdminRoute'

const AppShell = lazy(() => import('@/pages/welcome'))
const SettingsPage = lazy(() => import('@/pages/settings'))
const DocumentationPage = lazy(() => import('@/pages/features/documentation'))
const AboutPage = lazy(() => import('@/pages/about'))

export const appRoutes = [
  {
    path: '/app',
    element: (
      <PrivateRoute>
        <AppShell />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/app/chat" replace /> },
      { path: 'settings', element: <AdminRoute><SettingsPage /></AdminRoute> },
      { path: 'documentation', element: <DocumentationPage /> },
      { path: 'about', element: <AboutPage /> },
      ...chatRoutes,
      ...aiProposalRoutes,
      ...selfAnalyticsRoutes,
    ]
  }
]
