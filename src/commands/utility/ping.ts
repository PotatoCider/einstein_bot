import { Command, Category } from '..'
import { Self } from '../../Self'
import { Message } from 'discord.js'

export default class Ping extends Command {
    constructor(self: Self) {
        super({
            name: 'ping',
            category: Category.Utility,
            desc: 'Check bot\'s ping.',
            syntax: [''],
            aliases: [],
            perms: [],
            guild: false,
            self,
        })
    }

    public async run(msg: Message, _: string[]) {
        const embed = this.embed()
            .setDescription('Ping!')
            .setFooter('Note: this is not your real ping, its the bot\'s ping.')
        const start = Date.now()
        const pong = await msg.channel.send(embed)
        const end = Date.now()
        await pong.edit(
            embed.setDescription(`Pong! Time taken: \`${end - start}ms\``)
        )
    }
}
