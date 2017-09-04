import { push } from 'react-router-redux'
import constants from '../../utils/constants'

const TYPES = {
  SETUP: '',
  ADD_USER: '',
  CHANGE_DIALOG: '',
  OFF_USER: '',
  ADD_CHANNLE: '',
  SHOW_LIST: '',
  HIDE_LIST: '',
  CLEAR_BADGE: '',
  INCREASE_BADGE: '',
  RESET: '',
}
constants(TYPES, 'ASIDE')

const initalState = {
  users: {},
  channels: {},
  visible: false,
}

export default (state = initalState, action) => {
  switch (action.type) {
    case TYPES.SETUP:
      return {
        ...state,
        ...action.payload,
      }
    case TYPES.OFF_USER: {
      return {
        ...state,
        users: {
          ...state.users,
          [action.payload.tag]: {
            ...state.users[action.payload.tag],
            ...action.payload,
            online: false,
          },
        },
      }
    }
    case TYPES.ADD_USER: {
      return {
        ...state,
        users: {
          ...state.users,
          [action.payload.tag]: {
            ...state.users[action.payload.tag],
            ...action.payload,
            online: true,
          },
        },
      }
    }
    case TYPES.ADD_CHANNLE: {
      return {
        ...state,
        channels: {
          ...state.channels,
          [action.payload.key]: action.payload,
        },
      }
    }
    case TYPES.SHOW_LIST: {
      return {
        ...state,
        visible: true,
      }
    }
    case TYPES.HIDE_LIST: {
      return {
        ...state,
        visible: false,
      }
    }
    case TYPES.INCREASE_BADGE: {
      const { type, key } = action.id
      const types = `${type}s`
      return {
        ...state,
        [types]: {
          ...state[types],
          [key]: {
            ...state[types][key],
            badge: (state[types][key].badge || 0) + 1,
          },
        },
      }
    }
    case TYPES.CLEAR_BADGE: {
      const { type, key } = action.id
      const types = `${type}s`
      return {
        ...state,
        [types]: {
          ...state[types],
          [key]: {
            ...state[types][key],
            badge: 0,
          },
        },
      }
    }
    case TYPES.RESET: {
      return { ...initalState }
    }
    default:
      return state
  }
}

export const setup = ({ users, channels }) => ({
  type: TYPES.SETUP,
  payload: { users, channels },
})

export const addUser = message => ({
  type: TYPES.ADD_USER,
  payload: message,
})

export const offUser = message => ({
  type: TYPES.OFF_USER,
  payload: message,
})

export const addChannel = channel => ({
  type: TYPES.ADD_CHANNLE,
  payload: channel,
})

export const show = () => ({
  type: TYPES.SHOW_LIST,
})

export const hide = () => ({
  type: TYPES.HIDE_LIST,
})

export const changeDialog = (type, key) => push(`/chat/${type}/${key}`)

export const clearBadge = id => ({
  type: TYPES.CLEAR_BADGE,
  id,
})

export const increaseBadge = id => ({
  type: TYPES.INCREASE_BADGE,
  id,
})

export const reset = () => ({
  type: TYPES.RESET,
})
