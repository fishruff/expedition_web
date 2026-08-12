import { PageStub } from '@/components/ui/PageStub/PageStub'

export function StorePage() {
  return (
    <PageStub
      title="Магазин"
      todo={[
        'Карточки привилегий и их возможности',
        'Разовые товары и кейсы',
        'Подключение приёма платежей',
        'Дисклеймер: донат не даёт преимуществ в выживании',
      ]}
    />
  )
}
