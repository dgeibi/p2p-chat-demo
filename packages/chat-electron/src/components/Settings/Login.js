import React, { Component } from 'react'
import { Input, Form, Modal } from 'antd'
import { ipcRenderer } from 'electron'
import { validPort } from './validators'
import ModalBtn from '../Common/ModalBtn'
import { showError } from '../../utils/message'

function FormItem(props) {
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  }
  return <Form.Item {...formItemLayout} {...props} />
}

const validator = (form) => {
  form.validateFields((err, options) => {
    if (err) {
      showError('Settings Invalid')
      return
    }
    ipcRenderer.send('setup', options)
  })
}

@Form.create()
export class Login extends Component {
  render() {
    const { getFieldDecorator } = this.props.form
    const { visible, onCancel, onCreate } = this.props

    return (
      <Modal
        visible={visible}
        title="Settings/Login"
        okText="OK"
        cancelText="Cancel"
        onCancel={onCancel}
        onOk={onCreate}
      >
        <Form>
          <FormItem label="Username">
            {getFieldDecorator('username', {
              initialValue: this.props.username,
              rules: [
                {
                  required: true,
                  message: 'Please input your username!',
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem label="Port">
            {getFieldDecorator('port', {
              initialValue: this.props.port,
              rules: [
                {
                  required: true,
                },
                {
                  validator: validPort,
                },
              ],
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default props =>
  <ModalBtn
    component={Login}
    handleCreate={validator}
    type="primary"
    icon="setting"
    ghost
    {...props}
  />
