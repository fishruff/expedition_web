import { createBrowserRouter } from 'react-router'
import { MainLayout } from '@/layouts/MainLayout/MainLayout'
import { ROUTES } from '@/app/routes'
import { HomePage } from '@/pages/Home/HomePage'
import { RulesPage } from '@/pages/Rules/RulesPage'
import { StartPage } from '@/pages/Start/StartPage'
import { StorePage } from '@/pages/Store/StorePage'
import { MapPage } from '@/pages/Map/MapPage'
import { WikiPage } from '@/pages/Wiki/WikiPage'
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      { path: ROUTES.start, element: <StartPage /> },
      { path: ROUTES.rules, element: <RulesPage /> },
      { path: ROUTES.store, element: <StorePage /> },
      { path: ROUTES.map, element: <MapPage /> },
      { path: ROUTES.wiki, element: <WikiPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
