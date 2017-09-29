/* eslint-disable no-param-reassign, no-continue, no-underscore-dangle */
const net = require('net')
const logger = require('p2p-chat-logger')
const each = require('p2p-chat-utils/each')

const SocketHandler = require('./SocketHandler')
const login = require('./login')
const ensureMergeIPset = require('./ensureMergeIPset')
const { connectRange, connectScatter } = require('./connect')

const defaultOpts = {
  username: 'anonymous',
  port: 8087,
}

class Chat extends SocketHandler {
  constructor() {
    super()
    this.fileAccepted = {}
    this.clients = null
    this.active = false
    this.tag = null
    this.port = null
    this.address = null
    this.username = null
    this.downloadDir = 'Downloads'
  }

  setup(options, callback) {
    const opts = Object.assign({}, defaultOpts, options)

    // 已经处于启动状态，重新启动
    if (this.active) {
      // 保存用户地址/端口到 ipset
      opts.payload = opts.payload || {}

      // 退出后启动
      this.exit((err) => {
        if (!err) {
          this.setup(options, callback)
        } else {
          callback(err)
        }
      })
      return
    }

    opts.port = Math.trunc(opts.port)
    if (Number.isNaN(opts.port) || opts.port < 2000 || opts.port > 59999) {
      callback(TypeError('port should be a integer (2000~59999)'))
      return
    }
    if (typeof opts.username !== 'string') {
      callback(TypeError('username should be a string'))
      return
    }

    login(opts, this._login(callback))
  }

  setID({ port, username, tag, address, downloadDir }) {
    this.username = username
    this.port = port
    this.address = address
    this.tag = tag
    this.downloadDir = downloadDir || this.downloadDir
    this.clients = {}
  }

  _login(callback) {
    return (error, id) => {
      if (error) {
        callback(error)
        return
      }

      // id has props from opts
      this.setID(id)

      // 1. create server, sending data
      const server = net.createServer(this.handleSocket)

      const { host, port, username, tag, address, payload = {} } = id

      // 2. start listening
      server.listen({ port, host }, () => {
        this.server = server
        logger.verbose('>> opened server on', server.address())
        logger.verbose(`>> Hi! ${username}[${tag}]`)

        // 3. connect to other servers
        ensureMergeIPset(payload)
        this.connectServers(payload)
        this.active = true
        callback(null, {
          host,
          port,
          username,
          tag,
          address,
        })
      })
    }
  }

  exit(callback) {
    if (this.active) {
      each(this.clients, (client) => {
        client.end()
        client.destroy()
      })

      this.server.close(() => {
        this.active = false
        logger.verbose(`>> Bye! ${this.username}[${this.tag}]`)
        setImmediate(callback) // when reloading, why process.nextTick make the app slow
      })
    } else {
      callback()
    }
  }

  /**
   * 连接其它服务器
   * @param {setupPayload} opts
   */
  connectServers(opts) {
    if (!this.server.listening) return

    ensureMergeIPset(opts)
    connectRange(opts, this.address)
    connectScatter(opts, this.address)
    if (opts.ipset) {
      // 3. 连接 ipset 里的所有服务器地址
      this.connectIPset(opts.ipset)
    }
  }
}

module.exports = Chat
