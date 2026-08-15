import { RouterProvider } from 'react-router'
import { router } from '@/app/router'
import { SnapshotsProvider } from '@/data/SnapshotsProvider'

export function App() {
  return (
    <SnapshotsProvider>
      <RouterProvider router={router} />
    </SnapshotsProvider>
  )
}
