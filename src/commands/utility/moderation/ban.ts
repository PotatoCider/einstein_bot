import { Command, Category } from '../..'
import { Self } from '../../../Self'
import { Message } from 'discord.js'

export default class Ban extends Command {
    constructor(self: Self) {
        super({
            name: 'ban',
            category: Category.Moderation,
            desc: 'Bans someone out of the guild.',
            syntax: ['<member> [days] [reason]'],
            aliases: [],
            perms: ['BAN_MEMBERS'],
            guild: true,
            self,
        })
    }

    public async run(msg: Message, params: string[]) {
        const id = this.helpers.resolveMention(params[0])
        let days: number = 0, reason: string = ''
        if (params[1]) {
            if (isNaN(+params[1])) {
                reason = params[1]
            }
            days = +params[1]
            reason = params[2]
        }
        const member = await msg.guild!.members.ban(id, { days, reason }).catch(this.sendError(msg))
        if (member) {
            await msg.react(this.Emote.Checkmark)
        }
    }
}
