import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Глобалы vitest выключены, поэтому автоочистку RTL включаем руками.
afterEach(cleanup)
