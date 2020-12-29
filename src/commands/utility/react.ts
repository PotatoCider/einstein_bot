import { Command, Category } from '..'
import { Self } from '../../Self'
import { Message, GuildEmoji } from 'discord.js'
import { createCanvas } from 'canvas'

export default class React extends Command {
    constructor(self: Self) {
        super({
            name: 'react',
            category: Category.Utility,
            desc: 'Reacts colors, copy reactions etc',
            syntax: [
                'color <message_id> [channel] [color1] [color2] ... [colorN]',
                'copy/follow'
            ],
            aliases: [],
            perms: ['ADMINISTRATOR'],
            guild: true,
            self,
        })
    }

    public async run(msg: Message, params: string[]) {
        switch (params.shift()) {
            case 'color':
                const msgID = params.shift()
                if (!msgID) {
                    msg.channel.send('Invalid message ID')
                    return
                }
                const targetMsg = await msg.channel.messages.fetch(msgID).catch(this.handle(this.APIErrors.UNKNOWN_MESSAGE))
                if (!targetMsg) {
                    msg.channel.send('Invalid message ID')
                    return
                }
                await this.color(targetMsg, params)
                break
            case 'copy':
            case 'follow':

        }
    }

    private async color(msg: Message, colors: string[]) {
        const invalids = colors.filter(color => !color.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/))
        if (invalids.length > 0) {
            msg.channel.send('Invalid colors: ' + invalids.join(', '))
            return
        }
        const emotes = colors.map(color => {
            const canvas = createCanvas(128, 128)
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(64, 64, 64, 0, Math.PI * 2)
            ctx.fill()
            return canvas.toBuffer()
        })
        let availableSlots = this.helpers.getAvailableEmoteSlots(msg.guild!)
        if (availableSlots === 0) {
            // TODO: remove one emote slot and do reaction
            msg.channel.send('No available emote slots. Temporarily removing one emote.')
            msg.guild!.emojis.cache.first()
            return
        }
        while (emotes.length > 0) {
            // add emotes
            const ps: Promise<GuildEmoji>[] = []
            for (let i = 0; i < availableSlots && emotes.length > 0; i++) {
                const p = msg.guild!.emojis.create(emotes.shift()!, colors.shift()!.slice(1) + '_color', { reason: `add emote for message ${msg.id}` })
                ps.push(p)
            }
            const added = await Promise.all(ps)

            await Promise.all(added.map(e => msg.react(e)))
            await Promise.all(added.map(e => e.delete()))
        }
    }
}