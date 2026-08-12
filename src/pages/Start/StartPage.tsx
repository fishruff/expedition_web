import { PageStub } from '@/components/ui/PageStub/PageStub'

export function StartPage() {
  return (
    <PageStub
      title="Как начать играть"
      todo={[
        'Пошаговая инструкция подключения (версия клиента, IP, порт)',
        'Блок копирования IP в один клик',
        'Требования: лицензия/пиратка, моды, оптимизация',
        'Что делать в первый игровой день',
      ]}
    />
  )
}
