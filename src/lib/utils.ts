import router from '@/router'
import { IS_DEV } from '@/data/config'
import { twMerge } from 'tailwind-merge'
import { type ClassValue, clsx } from 'clsx'
import { camelize, getCurrentInstance, toHandlerKey } from 'vue'
import { NOTIFICATION_HEIGHT, NOTIFICATION_WIDTH } from '@/data/config'

export const gotoWelcome = (path: string) => {
  if (IS_DEV) {
    router.push('/welcome')
  } else {
    const browser = window.browser
    browser.windows.create({
      url: browser.runtime.getURL('popup.html#/welcome'),
      type: 'popup',
      width: NOTIFICATION_WIDTH,
      height: NOTIFICATION_HEIGHT,
      top: 0,
      left: 0,
    })
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
