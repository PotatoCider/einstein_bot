import { Command, Category } from '../..'
import { Self } from '../../../Self'
import { Message } from 'discord.js'

export default class Kick extends Command {
    constructor(self: Self) {
        super({
            name: 'kick',
            category: Category.Moderation,
            desc: 'Kicks someone out of the guild.',
            syntax: ['<member> [reason]'],
            aliases: [],
            perms: ['KICK_MEMBERS'],
            guild: true,
            self,
        })
    }

    public async run(msg: Message, params: string[]) {
        const id = this.helpers.resolveMention(params[0])
        let member = await msg.guild!.members.fetch(id).catch(this.sendError(msg))
        if (!member) {
            msg.react(this.Emote.Crossmark)
            return
        }
        member = await member.kick(params[1])
        if (member) {
            await msg.react(this.Emote.Checkmark)
        }
    }
}
