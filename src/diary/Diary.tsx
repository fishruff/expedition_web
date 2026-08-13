import { Outlet, useLocation, useNavigate } from 'react-router'
import { ROUTES } from '@/app/routes'
import { DiaryCover } from '@/diary/DiaryCover'
import styles from './Diary.module.scss'

/**
 * Книга целиком: обложка плюс текущий разворот.
 * Единственное место, где живут perspective и rotateY — развороты о 3D не знают.
 */
export function Diary() {
  const location = useLocation()
  const navigate = useNavigate()

  const isOpen = location.pathname !== ROUTES.home
  // Интро проигрываем только при переходе с обложки внутри сессии.
  // При прямом заходе по ссылке state пуст, и дневник сразу отрисован открытым.
  const intro = Boolean((location.state as { intro?: boolean } | null)?.intro)

  return (
    <div className={styles.stage}>
      <div
        className={styles.book}
        data-testid="diary"
        data-open={String(isOpen)}
        data-intro={String(intro)}
      >
        <div className={styles.pages}>
          <Outlet />
        </div>

        {/*
          Обложка остаётся в разметке ещё и во время интро — иначе анимацию раскрытия
          никто не увидит: элемент размонтируется раньше, чем начнётся поворот.
          Когда дневник уже открыт, обложка держится в DOM только ради анимации:
          inert убирает её из tab-order и дерева доступности, оставляя видимой.
        */}
        {(!isOpen || intro) && (
          <div className={styles.coverLeaf} inert={isOpen}>
            <DiaryCover onOpen={() => navigate(ROUTES.log, { state: { intro: true } })} />
          </div>
        )}
      </div>
    </div>
  )
}
