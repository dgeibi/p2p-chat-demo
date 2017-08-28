import React from 'react'
import { render } from 'react-dom'
import { ipcRenderer } from 'electron'

import { configureStore, history } from './redux'
import { showError, showInfo } from './utils/message'
import { loginActions } from './views/SettingsRedux'
import { chatListActions } from './views/AsideRedux'
import { dialogActions, filePanelActions } from './views/ChattingRedux'
import App from './layouts/App'

const store = configureStore()

if (!module.hot) {
  render(<App store={store} history={history} />, document.getElementById('root'))
} else {
  // eslint-disable-next-line global-require
  const { AppContainer } = require('react-hot-loader')

  const renderHot = (Root) => {
    render(
      <AppContainer>
        <Root store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    )
  }
  renderHot(App)

  module.hot.accept('./layouts/App', () => {
    renderHot(App)
  })
}

store.dispatch(loginActions.backToRoot())

// global
ipcRenderer.on('logout-reply', (event, { errMsg }) => {
  if (errMsg) {
    showError(errMsg)
  } else {
    showInfo('Logouted.')
  }
})

ipcRenderer.on('setup-reply', (event, { errMsg, id }) => {
  if (!errMsg) {
    store.dispatch(loginActions.updateSettings(id))
    store.dispatch(chatListActions.show())
  } else {
    showError(errMsg)
  }
})

ipcRenderer.on('bg-err', (event, { errMsg }) => {
  showError(errMsg)
})

ipcRenderer.on('text', (event, message) => {
  store.dispatch(dialogActions.newMessage(message))
})

ipcRenderer.on('text-sent', (event, message) => {
  store.dispatch(dialogActions.textSent(message))
})

// file send
ipcRenderer.on('file-sent', (event, info) => {
  store.dispatch(dialogActions.fileSentNotice(info))
})

ipcRenderer.on('file-send-fail', (event, info) => {
  store.dispatch(dialogActions.fileSendError(info))
})

ipcRenderer.on('file-unable-to-send', (event, { errMsg }) => {
  showError(errMsg)
})

// file receive
ipcRenderer.on('fileinfo', (event, message) => {
  store.dispatch(filePanelActions.fileCome(message))
})

ipcRenderer.on('file-process-start', (event, message) => {
  store.dispatch(filePanelActions.fileStart(message))
})

ipcRenderer.on('file-processing', (event, message) => {
  store.dispatch(filePanelActions.fileProcessing(message))
})

ipcRenderer.on('file-process-done', (event, message) => {
  store.dispatch(filePanelActions.fileEnd(message))
})

ipcRenderer.on('file-receive-fail', (event, message) => {
  store.dispatch(filePanelActions.fileReceiveError(message))
})

ipcRenderer.on('file-receiced', (event, message) => {
  store.dispatch(filePanelActions.fileReceived(message))
})
