import { GuildMember, Message, TextChannel } from 'discord.js'
import { readFileSync } from 'fs'
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

        if (member) {
            console.log(member.id)
            const exitCode = await this.welcome(member, true)
            console.log(exitCode)
        }
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
        const image = await Jimp.read("src/assets/welcome.png")
        const font = await Jimp.loadFont("src/assets/font.fnt")
        const fontCodeArray = JSON.parse(readFileSync('src/assets/font.json', { encoding: 'utf-8' })) as number[]

        const fontCodes = new Set(fontCodeArray.concat(32)) // spaces included

        // place avatar in the welcome image
        const avatar = await Jimp.read(member.user.displayAvatarURL({ size: 512, format: 'png' }))
        avatar.resize(290, 290)
        image.composite(avatar, 407, 248, { mode: Jimp.BLEND_DESTINATION_OVER } as any) // TODO: fix this

        // replace unsupported characters
        const tagArray = member.user.tag.split('')
        for (let i = 0; i < tagArray.length; i++) {
            if (!fontCodes.has(tagArray[i].charCodeAt(0))) tagArray[i] = '_'
        }
        let tag = tagArray.join('')

        // ensure discord tag width does not exceed 1024 px
        let width = Jimp.measureText(font, tag) + (tag.split(' ').length - 1) * 39 // width = character length + spaces * 39

        while (width > 1024) { // TODO: optimise this
            tag = tag.slice(0, -1)
            width = Jimp.measureText(font, tag) + (tag.split(' ').length - 1) * 39
        }

        // print text on image
        image.print(font, ~~(552 - width / 2), 635, { text: tag })

        const imageBuffer = await image.getBufferAsync('image/png')

        const channelID = await this.redis.hget(`guilds:${member.guild.id}:config`, 'welcome')
        const channel = member.guild.channels.resolve(channelID!) as TextChannel
        channel.send('welcome bitch', { files: [{ attachment: imageBuffer, name: 'welcome.png' }] })
    }
}
