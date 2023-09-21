import queryActions from './query-actions'
import authorizeActions from './authorize-actions'

export const queryKeys = Object.keys(queryActions).map(key => key)
export const authorizeKeys = Object.keys(authorizeActions).map(key => key)