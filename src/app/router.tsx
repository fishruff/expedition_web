import { createBrowserRouter, type RouteObject } from 'react-router'
import { Desk } from '@/scene/Desk/Desk'
import { Home } from '@/sections/Home/Home'
import { Crew } from '@/sections/Crew/Crew'
import { Member } from '@/sections/Crew/Member'
import { Log } from '@/sections/Log/Log'
import { Charter } from '@/sections/Charter/Charter'
import { Archive } from '@/sections/Archive/Archive'
import { MapSection } from '@/sections/MapSection/MapSection'
import { Chronometer } from '@/sections/Chronometer/Chronometer'
import { ROUTES } from '@/app/routes'
import { Gate } from '@/ui/Gate/Gate'

// Временные заглушки: разделы наполняются авторскими данными следующим шагом.
// Маршруты и замки на них держим рабочими уже сейчас.
const stub = (title: string) => <h1>{title}</h1>

export const routes: RouteObject[] = [
  {
    element: <Desk />,
    children: [
      { path: ROUTES.home, element: <Home /> },
      { path: ROUTES.log, element: <Log /> },
      { path: ROUTES.crew, element: <Crew /> },
      // Карточка участника занимает весь разворот: боковые панели ей мешают.
      { path: ROUTES.crewMember, element: <Member />, handle: { wide: true } },
      { path: ROUTES.charter, element: <Charter /> },
      {
        path: ROUTES.archive,
        element: (
          <Gate section="archive" title="Архив">
            <Archive />
          </Gate>
        ),
      },
      {
        path: ROUTES.map,
        element: (
          <Gate section="map" title="Карта">
            <MapSection />
          </Gate>
        ),
      },
      {
        path: ROUTES.chronometer,
        element: (
          <Gate section="chronometer" title="Хронометр">
            <Chronometer />
          </Gate>
        ),
      },
      { path: '*', element: stub('Страница вырвана') },
    ],
  },
]

export const router = createBrowserRouter(routes)
