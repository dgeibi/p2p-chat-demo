import getConstants from '../../utils/constants'

const initialState = {}

const TYPES = {
  FILE_INFO: '',
  FILE_START: '',
  FILE_PROCESSING: '',
  FILE_END: '',
  FILE_FAIL: '',
  FILE_DONE: '',
}
getConstants(TYPES, 'CHATTING')

export default function filePanel(state = initialState, action) {
  switch (action.type) {
    case TYPES.FILE_INFO:
      // state.push()
      break
    default:
      break
  }
}

export function init() {}
export function test() {}
// export function