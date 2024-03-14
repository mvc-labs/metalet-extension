import router from '@/router'
import { IS_DEV } from '@/data/config'
import { twMerge } from 'tailwind-merge'
import { type ClassValue, clsx } from 'clsx'
import { camelize, getCurrentInstance, toHandlerKey } from 'vue'

export const gotoWelcome = (path: string) => {
  if (IS_DEV) {
    router.push('/welcome')
  } else {
    const { origin, pathname } = window.location
    window.open(`${origin}${pathname}/#${path}`, '_blank')
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
