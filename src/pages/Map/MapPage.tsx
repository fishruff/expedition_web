import { PageStub } from '@/components/ui/PageStub/PageStub'

export function MapPage() {
  return (
    <PageStub
      title="Карта мира"
      todo={[
        'Встроить онлайн-карту (Dynmap / BlueMap) через iframe',
        'Переключение между мирами: обычный, Незер, Край',
        'Список точек интереса и городов игроков',
      ]}
    />
  )
}
