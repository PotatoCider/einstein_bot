export { default as Handler } from './Handler'
import GuildMemberAdd from './guild_member_add'
import Message from './message'

export const HandlerList = [Message, GuildMemberAdd]
