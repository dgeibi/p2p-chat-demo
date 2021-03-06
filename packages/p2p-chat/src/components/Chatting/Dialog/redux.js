import { ipcRenderer } from 'electron'
import createReducer from '../../../utils/createReducer'
import makeConstants from '../../../utils/constants'
import getNewState from '../../../utils/getNewState'
import storage from '../../../utils/storage'

const initialState = {
  user: {},
  channel: {},
}

const TYPES = {
  NEW_MESSAGE: '',
  MESSAGE_SENT: '',
  FETCH_MESSAGES: '',
  MESSAGES_FETCHED: '',
  SEND_MY_MESSAGE: '',
  SEND_FILES: '',
  FILE_SENT: '',
  FILE_SEND_ERROR: '',
  SOCKET_ERROR: '',
  ADD_FILE: '',
  REMOVE_FILE: '',
  SET_TEXT: '',
  RESTORE: '',
}
makeConstants(TYPES, 'DIALOG')

function updateMessage(state, action) {
  const type = action.payload.channel ? 'channel' : 'user'
  const key = action.payload.channel || action.payload.tag
  const newState = getNewState(state, type, key)
  if (newState[type][key].messages) {
    newState[type][key].messages = [...state[type][key].messages, action.payload]
  } else {
    newState[type][key].messages = [action.payload]
  }
  return newState
}

const reducerMap = {
  [TYPES.FILE_SENT]: updateMessage,
  [TYPES.FILE_SEND_ERROR]: updateMessage,
  [TYPES.MESSAGE_SENT]: updateMessage,
  [TYPES.NEW_MESSAGE]: updateMessage,
  [TYPES.SOCKET_ERROR]: updateMessage,
  [TYPES.ADD_FILE](state, action) {
    const { type, key } = action.id
    const newState = getNewState(state, type, key)
    const s = newState[type][key]
    if (s.filePaths) {
      s.filePaths = [...new Set([...s.filePaths, action.payload])]
    } else {
      s.filePaths = [action.payload]
    }
    return newState
  },
  [TYPES.REMOVE_FILE](state, action) {
    const { type, key } = action.id
    const newState = getNewState(state, type, key)
    const s = newState[type][key]
    s.filePaths = s.filePaths.slice()
    const index = s.filePaths.indexOf(action.payload)
    s.filePaths.splice(index, 1)
    return newState
  },
  [TYPES.SEND_FILES](state, action) {
    const { type, key } = action.id
    const newState = getNewState(state, type, key)
    newState[type][key].filePaths = []
    return newState
  },
  [TYPES.SET_TEXT](state, action) {
    const { type, key } = action.id
    const newState = getNewState(state, type, key)
    newState[type][key].text = action.payload
    return newState
  },
  [TYPES.RESTORE](state, action) {
    if (action.payload) return action.payload
    return state
  },
}

export default createReducer(reducerMap, initialState)

export const newMessage = msg => {
  const now = Date.now()
  const payload = {
    ...msg,
    uid: now + msg.tag,
    date: now,
  }
  return {
    type: TYPES.NEW_MESSAGE,
    payload,
  }
}

export const sendMessage = (id, text) => {
  const { tags, channel } = id
  ipcRenderer.send('local-text', { tags, payload: { text, channel } })

  return {
    type: TYPES.SEND_MY_MESSAGE,
    id,
  }
}

export const sendFiles = (id, paths) => {
  const { tags, channel } = id

  paths.forEach(filepath => {
    ipcRenderer.send('local-file', { tags, filepath, payload: { channel } })
  })

  return {
    type: TYPES.SEND_FILES,
    id,
  }
}

export const fileSentNotice = info => {
  const { filename, username } = info
  const message = `sent ${username} '${filename}' successfully.`
  const payload = {
    ...info,
    uid: info.filename + info.tag + performance.now(),
    alert: 'success',
    message,
  }
  return {
    type: TYPES.FILE_SENT,
    payload,
  }
}

export const textSent = msg => {
  const uid = Date.now()
  const payload = {
    ...msg,
    uid,
    self: true,
    date: uid,
  }
  return {
    type: TYPES.MESSAGE_SENT,
    payload,
  }
}

export const fileSendError = info => {
  const { filename, username, tag, error } = info
  const message = `Failed to send ${username} '${filename}'`
  const description = error.message
  const payload = {
    ...info,
    uid: filename + tag + Date.now(),
    alert: 'error',
    message,
    description,
  }
  return {
    type: TYPES.FILE_SEND_ERROR,
    payload,
  }
}

export const socketError = info => {
  const { filename, tag, error } = info
  const message = `Something Wrong with the socket`
  const description = error.message
  const payload = {
    ...info,
    uid: filename + tag + Date.now(),
    alert: 'error',
    message,
    description,
  }
  return {
    type: TYPES.SOCKET_ERROR,
    payload,
  }
}

export const addFile = (id, path) => ({
  type: TYPES.ADD_FILE,
  id,
  payload: path,
})

export const removeFile = (id, path) => ({
  type: TYPES.REMOVE_FILE,
  id,
  payload: path,
})

export const setText = (id, text) => ({
  type: TYPES.SET_TEXT,
  id,
  payload: text,
})

export const restoreDialog = tag => ({
  type: TYPES.RESTORE,
  payload: storage.get(`dialog-${tag}`),
})
