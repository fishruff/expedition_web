import { createBrowserRouter, type RouteObject } from 'react-router'
import { Desk } from '@/scene/Desk/Desk'
import { Home } from '@/sections/Home/Home'
import { Crew } from '@/sections/Crew/Crew'
import { Member } from '@/sections/Crew/Member'
import { ROUTES } from '@/app/routes'
import { Gate } from '@/ui/Gate/Gate'
import type { SectionName } from '@/data/unlocks'

// Временные заглушки: разделы наполняются авторскими данными следующим шагом.
// Маршруты и замки на них держим рабочими уже сейчас.
const stub = (title: string) => <h1>{title}</h1>

/** Раздел за замком: до находки в игре вместо содержимого стоит силуэт. */
const gated = (section: SectionName, title: string) => (
  <Gate section={section} title={title}>
    {stub(title)}
  </Gate>
)

export const routes: RouteObject[] = [
  {
    element: <Desk />,
    children: [
      { path: ROUTES.home, element: <Home /> },
      { path: ROUTES.log, element: stub('Дневник') },
      { path: ROUTES.crew, element: <Crew /> },
      { path: ROUTES.crewMember, element: <Member /> },
      { path: ROUTES.charter, element: stub('Устав') },
      { path: ROUTES.archive, element: gated('archive', 'Архив') },
      { path: ROUTES.map, element: gated('map', 'Карта') },
      { path: ROUTES.chronometer, element: gated('chronometer', 'Хронометр') },
      { path: '*', element: stub('Страница вырвана') },
    ],
  },
]

export const router = createBrowserRouter(routes)
