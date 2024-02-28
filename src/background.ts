import connector from './lib/connector'
import { isLocked } from './lib/password'
import actions from './data/query-actions'
import browser from 'webextension-polyfill'
import exActions from './data/extension-actions'
import { getAddress, getCurrentAccount } from './lib/account'
import { NOTIFICATION_HEIGHT, NOTIFICATION_WIDTH } from './data/config'

// const browser = window.browser as typeof chrome
browser.runtime.onMessage.addListener(async (msg, sender) => {
  try {
    if (msg.channel === 'inter-metaidwallet') {
      if (msg.eventName === 'lock') {
        return await browser.action.setBadgeText({ text: '🔒' })
      } else if (msg.eventName === 'unlock') {
        return await browser.action.setBadgeText({ text: null })
      }
      return await exActions[msg.fn](...msg.args)
    }

    const actionName = msg.action
      .replace('authorize-', '')
      .replace('query-', '')
      .replace('event-', '')
      .replace('inscribe-', '')
    if (msg.action?.startsWith('query') && actionName === 'Ping') {
      const response = {
        nonce: msg.nonce,
        channel: 'from-metaidwallet',
        action: `respond-${actionName}`,
        host: msg.host as string,
        res: 'pong',
      }
      return response
    }

    const account = await getCurrentAccount()
    const walletLocked = await isLocked()

    // 如果连接状态为未连接，且请求的 action 不是connect或者IsConnected，则返回错误
    let failedStatus: string = ''
    if (walletLocked) {
      failedStatus = 'locked'
    } else if (!account || !account.id) {
      failedStatus = 'not-logged-in'
    } else if (
      !(await connector.isConnected(account.id, msg.host)) &&
      !['Connect', 'IsConnected', 'ConnectBTC'].includes(actionName)
    ) {
      failedStatus = 'not-connected'
    }

    if (!!failedStatus) {
      const response = {
        nonce: msg.nonce,
        channel: 'from-metaidwallet',
        action: `respond-${actionName}`,
        host: msg.host as string,
        res: {
          status: failedStatus,
        },
      }

      return response
    }

    if (msg.action?.startsWith('inscribe')) {
      if (actionName === 'InscribeTransfer') {
        const rawUrl = 'popup.html#/wallet/inscribe'
        let popupUrl = browser.runtime.getURL(rawUrl)
        const address = await getAddress('btc')
        popupUrl += `/${msg.params}/${address}`
        let top = 0
        let left = 0
        const lastFocused = await browser.windows.getLastFocused()
        top = lastFocused.top!
        left = lastFocused.left! + lastFocused.width! - NOTIFICATION_WIDTH
        const popupWindow = await browser.windows.create({
          url: popupUrl,
          type: 'popup',
          width: NOTIFICATION_WIDTH,
          height: NOTIFICATION_HEIGHT,
          top,
          left,
        })
      }
      return
    }

    // authorize actions
    if (msg.action?.startsWith('authorize')) {
      const icon = sender.tab?.favIconUrl || msg.icon || ''
      const rawUrl = 'popup.html#authorize'
      // 拼接授权页的参数
      const params = new URLSearchParams()
      params.append('host', msg.host)
      params.append('icon', icon)
      params.append('actionName', actionName)
      params.append('nonce', msg.nonce)
      params.append('params', JSON.stringify(msg.params))

      // 在弹窗创建前，先存储发起请求的tab id
      if (sender.tab?.id) {
        params.append('tabId', sender.tab.id.toString())
      }

      let popupUrl = browser.runtime.getURL(rawUrl)
      popupUrl += `?${params.toString()}`

      // To avoid repeating pop-ups of 'sign btc message'
      let isClose = false
      const tabs = await browser.tabs.query({ active: true })
      tabs.forEach((tab) => {
        isClose =
          (tab.url?.includes('actionName=SignBTCMessage') || false) &&
          (tab.url?.includes(`params=%22${msg.params}%22`) || false)
      })
      if (isClose) {
        return
      }

      let top = 0
      let left = 0
      const lastFocused = await browser.windows.getLastFocused()
      top = lastFocused.top!
      left = lastFocused.left! + lastFocused.width! - NOTIFICATION_WIDTH
      // open authorize page in a popup window
      const popupWindow = await browser.windows.create({
        url: popupUrl,
        type: 'popup',
        width: NOTIFICATION_WIDTH,
        height: NOTIFICATION_HEIGHT,
        top,
        left,
      })

      if (popupWindow.id) {
        // 给弹出窗口的关闭事件添加监听，如果用户关闭了弹窗，则返回取消
        browser.windows.onRemoved.addListener(async (windowId) => {
          if (windowId === popupWindow.id) {
            // 发送消息给 content-script-tab
            const tab = (
              await browser.tabs.query({
                active: true,
                windowType: 'normal',
              })
            ).find((tab) => tab.id === Number(sender.tab?.id))
            if (tab?.id) {
              const response = {
                nonce: msg.nonce,
                channel: 'from-metaidwallet',
                action: `respond-${actionName}`,
                host: msg.host as string,
                res: {
                  status: 'canceled',
                },
              }
              browser.tabs.sendMessage(tab.id, response)
            }
          }
        })
      }

      return true
    }

    // query actions
    if (msg.action?.startsWith('query')) {
      // call corresponding process function
      const action = actions[actionName]
      if (action) {
        const processed = await action.process(msg.params, msg.host as string)

        const response = {
          nonce: msg.nonce,
          channel: 'from-metaidwallet',
          action: `respond-${actionName}`,
          host: msg.host as string,
          res: processed,
        }

        return response
      }
    }

    return true
  } catch (error) {
    console.error('browser.runtime.onMessage', error)
  }
})
