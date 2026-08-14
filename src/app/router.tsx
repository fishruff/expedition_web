import { createBrowserRouter, type RouteObject } from 'react-router'
import { Desk } from '@/scene/Desk/Desk'
import { Home } from '@/sections/Home/Home'
import { ROUTES } from '@/app/routes'

// Временные заглушки. Настоящие разделы приедут по новому плану — пиксельная
// сцена с книгой, панелями и предметами. Маршруты держим рабочими уже сейчас.
const stub = (title: string) => <h1>{title}</h1>

export const routes: RouteObject[] = [
  {
    element: <Desk />,
    children: [
      { path: ROUTES.home, element: <Home /> },
      { path: ROUTES.log, element: stub('Судовой журнал') },
      { path: ROUTES.crew, element: stub('Экипаж') },
      { path: ROUTES.crewMember, element: stub('Участник') },
      { path: ROUTES.news, element: stub('Летопись') },
      { path: ROUTES.charter, element: stub('Устав') },
      { path: ROUTES.map, element: stub('Карта') },
      { path: '*', element: stub('Страница вырвана') },
    ],
  },
]

export const router = createBrowserRouter(routes)
