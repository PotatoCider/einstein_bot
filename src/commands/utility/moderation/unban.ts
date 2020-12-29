import { Command, Category } from '../..'
import { Self } from '../../../Self'
import { Message } from 'discord.js'

export default class Unban extends Command {
    constructor(self: Self) {
        super({
            name: 'unban',
            category: Category.Moderation,
            desc: 'Unbans someone.',
            syntax: ['<member> [reason]', 'all [reason]'],
            aliases: [],
            perms: ['BAN_MEMBERS'],
            guild: true,
            self,
        })
    }

    private async unbanAll(msg: Message, reason?: string) {
        let unbanned = 0
        const m = await msg.channel.send(`Unbanned ${unbanned} members.`)
        const bans = await msg.guild!.fetchBans()
        const ps = bans.map(banInfo => msg.guild!.members.unban(banInfo.user, reason).then(() => { unbanned++ }))
        const timer = this.client.setInterval(() => m.edit(`Unbanned ${unbanned} members.`), 1000)
        await Promise.all(ps)
        this.client.clearInterval(timer)
        m.edit(`Unbanned ${unbanned} members.`)
        m.react(this.Emote.Checkmark)
    }

    public async run(msg: Message, params: string[]) {
        const user = params.shift()!
        const reason = params.join(' ')
        if (user === 'all') {
            // TODO: add confirmation
            await this.unbanAll(msg, reason)
            return
        }
        const id = this.helpers.resolveMention(user)
        // TODO: ch
        const member = await msg.guild!.members.unban(id, reason).catch(this.sendError(msg))
        if (member) {
            await msg.react(this.Emote.Checkmark)
        }
    }
}
