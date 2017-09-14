import has from 'p2p-chat-utils/has'
import pickBy from 'p2p-chat-utils/pickBy'

const pickProps = (stub, src) => pickBy(src, (value, key) => has(stub, key))

const getChannelOnlineMembers = (members, users) =>
  Object.values(users ? pickProps(members, users) : members).filter(x => x.online)

const getInfo = ({ users, channels }, { type, key }) => {
  if (type === 'user') return users[key]
  if (type === 'channel') {
    const channel = { ...channels[key] }
    channel.users = pickProps(channel.users, users)
    channel.onlineCount = getChannelOnlineMembers(channel.users).length
    channel.online = channel.onlineCount > 0
    channel.totalCount = Object.keys(channel.users).length
    return channel
  }
  return null
}

export default getInfo

export const selectInfo = (state, ownProps) => {
  const { type, key } = ownProps.match.params
  const { users, channels } = state.aside.chatList
  return getInfo({ users, channels }, { type, key })
}