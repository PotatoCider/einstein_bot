import {
    Message,
    MessageReaction,
    PartialUser,
    User,
    ChannelLogsQueryOptions,
    TextChannel,
} from 'discord.js'
import { Command, Category } from '../..'
import { Self } from '../../../Self'
export default class Clear extends Command {
    constructor(self: Self) {
        super({
            name: 'clear',
            category: Category.Moderation,
            desc: 'Clears messages.',
            syntax: ['[count]'],
            aliases: ['prune', 'delete'],
            perms: ['MANAGE_MESSAGES'],
            guild: true,
            self,
        })
    }

    private async deleteMessages(caller: Message, opts: ChannelLogsQueryOptions) {
        const toDelete = await caller.channel.messages.fetch(opts)
        toDelete.delete(caller.id) // don't delete command caller's message first

        await (caller.channel as TextChannel).bulkDelete(toDelete, true).catch(this.sendError(caller))
        caller.react(this.Emote.Checkmark)
        await caller.delete({ timeout: 3000 })
    }

    private reactListener(caller: Message) {
        let timer: NodeJS.Timeout
        const listener = (r: MessageReaction, user: User | PartialUser) => {
            if (r.message.channel.id !== caller.channel.id) return
            if (user.id !== caller.author.id) return
            this.client.removeListener('messageReactionAdd', listener)
            this.client.clearTimeout(timer)

            this.deleteMessages(caller, { limit: 100, after: r.message.id })
        }
        timer = this.client.setTimeout(() => {
            this.client.removeListener('messageReactionAdd', listener)
        }, 60000)
        return listener
    }

    public async run(msg: Message, params: string[]) {
        if (params.length === 0) {
            msg.channel.messages.fetch({ limit: 100 }) // add to cache
            this.client.on('messageReactionAdd', this.reactListener(msg))
        } else {
            if (isNaN(+params[0])) {
                msg.react(this.Emote.Crossmark)
            } else {
                await this.deleteMessages(msg, { limit: +params[0] + 1 })
            }
        }
    }
}
