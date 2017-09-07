import { ipcRenderer } from 'electron'
import getConstants from '../../utils/constants'

const initialState = {
  user: {},
  channel: {},
}

const TYPES = {
  FILE_INFO: '',
  FILE_START: '',
  FILE_PROCESSING: '',
  FILE_END: '',
  FILE_FAIL: '',
  FILE_DONE: '',
  ACCEPT_FILE: '',
}

getConstants(TYPES, 'CHATTING_FILE')

export default function filePanel(state = initialState, action) {
  switch (action.type) {
    case TYPES.FILE_INFO:
    case TYPES.FILE_START: {
      const { type, key, id } = findPos(action.payload)
      return {
        ...state,
        [type]: {
          ...state[type],
          [key]: {
            [id]: action.payload,
            ...state[type][key],
          },
        },
      }
    }
    case TYPES.ACCEPT_FILE: {
      const { type, key, id } = findPos(action.payload)
      const newState = { ...state }
      delete newState[type][key][id]
      return newState
    }
    case TYPES.FILE_END:
    case TYPES.FILE_PROCESSING:
    case TYPES.FILE_FAIL:
    case TYPES.FILE_DONE: {
      const { type, key, id } = findPos(action.payload)
      return {
        ...state,
        [type]: {
          ...state[type],
          [key]: {
            ...state[type][key],
            [id]: {
              ...state[type][key][id],
              ...action.payload,
            },
          },
        },
      }
    }
    default:
      return state
  }
}

export const fileCome = message => ({
  type: TYPES.FILE_INFO,
  payload: { ...message, type: 'file:info' },
})

export const fileStart = message => ({
  type: TYPES.FILE_START,
  payload: { ...message, type: 'file:receive', percent: 0, speed: 0 },
})

export const fileProcessing = message => ({
  type: TYPES.FILE_PROCESSING,
  payload: message,
})

export const fileEnd = message => ({
  type: TYPES.FILE_END,
  payload: { ...message, percent: 1, speed: 0 },
})

export const fileReceiveError = message => ({
  type: TYPES.FILE_FAIL,
  payload: { ...message, errMsg: `Fail to receive ${message.filename}` },
})

export const fileReceived = message => ({
  type: TYPES.FILE_DONE,
  payload: { ...message, ok: true },
})

export const acceptFile = ({ tag, checksum, channel, id }) => {
  ipcRenderer.send('accept-file', {
    tag,
    checksum,
    payload: { checksum, channel },
  })
  return {
    type: TYPES.ACCEPT_FILE,
    payload: { tag, channel, id },
  }
}

function findPos({ tag, channel, id }) {
  if (channel) {
    return { type: 'channel', key: channel, id }
  }
  return { type: 'user', key: tag, id }
}
