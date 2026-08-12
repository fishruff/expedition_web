import { PageStub } from '@/components/ui/PageStub/PageStub'

export function WikiPage() {
  return (
    <PageStub
      title="Вики"
      todo={[
        'Описание кастомных механик и плагинов',
        'Команды сервера и приваты территорий',
        'Экономика: валюта, рынок, аукцион',
        'Гайды новичкам',
      ]}
    />
  )
}
