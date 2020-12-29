import { GuildMember, Message } from 'discord.js'
import Jimp from 'jimp'
import { Command, Category } from '../..'
import { Self } from '../../../Self'


export default class Welcome extends Command {
    constructor(self: Self) {
        super({
            name: 'welcome',
            category: Category.Moderation,
            desc: 'Force welcomes someone.',
            syntax: ['<member> [force]'],
            aliases: [],
            perms: ['BAN_MEMBERS'],
            guild: true,
            self,
        })
    }

    public async run(msg: Message, params: string[]) {
        const memberID = this.helpers.resolveMention(params.shift()!)
        const member = await msg.guild!.members.fetch(memberID).catch(console.error)
        if (member) this.welcome(member, true)
    }

    public async welcome(member: GuildMember, force?: boolean) {
        const guildKey = `guilds:${member.guild.id}`
        const welcomeEnabled = await this.redis.hget(`${guildKey}:config`, 'welcome')
        if (!welcomeEnabled) return 1

        const memberKey = `${guildKey}:members:${member.id}`
        const welcomed = await this.redis.hget(memberKey, 'welcomed')
        if (welcomed && !force) return 2

        this.redis.hset(memberKey, 'welcomed', '1')

        switch (member.guild.id) {
            case '346244476211036160': // TODO: constant this
                this.welcomeXeno(member)
                break
            default:
            // TODO: implement generalised welcome
        }

        return 0
    }

    public async welcomeXeno(member: GuildMember) {
        const welcomeImage = await Jimp.read("assets/welcome.png")
        const fontCodes = new Set(require('../../../assets/font.json').concat(32) as number[]) // spaces included
        const avatar = await Jimp.read(member.user.displayAvatarURL({ size: 512 }))

        let tag = member.user.tag
        for (let i = 0; i < tag.length; i++) {
            if ()
        }
    }
}
