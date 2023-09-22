import { createAction } from './create-action'
import { authorizeActionNames } from '../data/authorize-actions'
import { queryActionNames } from '../data/query-actions'

const metalet: any = {}

const camelCased = (str: string) => str.charAt(0).toLowerCase() + str.slice(1)

queryActionNames.forEach((actionName) => {
  const actionNameCamelCased = camelCased(actionName)

  metalet[actionNameCamelCased] = async (params?: any) => {
    return await createAction(actionName, 'query', params)
  }
})

authorizeActionNames.forEach((actionName) => {
  const actionNameCamelCased = camelCased(actionName)

  metalet[actionNameCamelCased] = async (params?: any) => {
    return await createAction(actionName as string, 'authorize', params)
  }
})

window.metaidwallet = metalet

export {}
