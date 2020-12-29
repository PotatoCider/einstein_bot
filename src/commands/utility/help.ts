import { Self } from '../../Self'
import { Command, Category } from '..'
import { Message, Snowflake } from 'discord.js'

export default class Help extends Command {
    private commands: Map<string, Command>
    constructor(self: Self) {
        super({
            name: 'help',
            category: Category.Utility,
            desc: 'Displays list of commands',
            syntax: ['[command]'],
            aliases: ['?'],
            perms: [],
            guild: false,
            botOwner: true,
            self,
        })
        this.commands = this.self.commands
    }

    private generateHelp(guildID: Snowflake | null) {
        const helps: Map<Category, string> = new Map()
        this.commands.forEach(cmd => {
            if (guildID && typeof cmd.guild !== 'boolean' && !cmd.guild.includes(guildID))
                return
            const help = helps.get(cmd.category) || ''
            helps.set(cmd.category, help + cmd.runHelp(false) + '\n')
        })

        const embed = this.embed().setTitle('Commands')
        helps.forEach((help, key) => embed.addField(key, help))
        return embed
    }

    public async run(msg: Message, params: string[]) {
        if (params.length > 0) {
            const cmdName = params.shift()
            const cmd = this.commands.get(cmdName!)
            if (cmd) {
                await msg.channel.send(cmd.runHelp(true))
            } else {
                msg.react(this.Emote.Crossmark)
            }
            return
        }
        const embed = this.generateHelp(msg.guild && msg.guild.id)
        // .setColor(this.Constants.Random)
        await msg.channel.send(embed)
    }
}
