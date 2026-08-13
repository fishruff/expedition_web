import { createBrowserRouter, type RouteObject } from 'react-router'
import { DeskScene } from '@/scene/DeskScene/DeskScene'
import { ROUTES } from '@/app/routes'

// Временные заглушки: заменяются реальными разворотами в задачах 6–10.
const stub = (title: string) => <h1>{title}</h1>

export const routes: RouteObject[] = [
  {
    element: <DeskScene />,
    children: [
      { path: ROUTES.home, element: stub('Expedition') },
      { path: ROUTES.log, element: stub('Судовой журнал') },
      { path: ROUTES.crew, element: stub('Экипаж') },
      { path: ROUTES.crewMember, element: stub('Участник') },
      { path: ROUTES.news, element: stub('Новости экспедиции') },
      { path: ROUTES.charter, element: stub('Устав экипажа') },
      { path: ROUTES.map, element: stub('Карта') },
      { path: '*', element: stub('Страница вырвана') },
    ],
  },
]

export const router = createBrowserRouter(routes)
