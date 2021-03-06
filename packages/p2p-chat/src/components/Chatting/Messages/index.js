import React, { Component } from 'react'
import { Alert } from 'antd'
import PropTypes from 'prop-types'

import Text from './Text'
import styles from './Messages.scss'

class Messages extends Component {
  static propTypes = {
    messages: PropTypes.array.isRequired,
    username: PropTypes.string.isRequired,
  }

  saveMessageList = div => {
    this.messageList = div
  }

  scrollToBottom() {
    if (!this.messageList) return
    const { scrollHeight } = this.messageList
    const height = this.messageList.clientHeight
    const maxScrollTop = scrollHeight - height
    this.messageList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  shouldComponentUpdate(nextProps) {
    return this.props.messages.length !== nextProps.messages.length
  }

  render() {
    const { messages, username } = this.props
    return (
      <div className={styles.messages} ref={this.saveMessageList}>
        {messages.map(msg => {
          const props = { key: msg.uid }
          if (msg.alert) {
            const { message, description, alert } = msg
            return (
              <Alert
                className={styles.alert}
                message={message}
                description={description}
                type={alert}
                showIcon
                {...props}
              />
            )
          }
          if (msg.text) {
            props.myName = username
            return <Text {...msg} {...props} />
          }
          return null
        })}
      </div>
    )
  }
}

export default Messages
