import Handler from './Handler'
import Discord from 'discord.js'
import { Command } from '../commands'
import { Self } from '../Self'

export default class Message extends Handler<'message'> {
    private prefix: string = this.self.prefix
    constructor(self: Self) {
        super(self, 'message')
    }
    private commands: Map<string, Command> = this.self.commands
    private aliases: Map<string, string> = this.self.aliases

    // dryRun(msg: Discord.Message): [string, string[]] | [] {
    //     if (msg.author.bot || !msg.content.startsWith(this.prefix)) return []

    //     const params = msg.content.split(' ')
    //     const inputCmd = params.shift()!.slice(this.prefix.length)
    //     const cmdName = this.aliases.get(inputCmd) || inputCmd
    //     return [cmdName, params]
    // }

    async run(msg: Discord.Message) {
        // TODO: add custom prefixes
        if (msg.author.bot || !msg.content.startsWith(this.prefix)) return

        const params = msg.content.split(' ')
        const inputCmd = params.shift()!.slice(this.prefix.length)
        const cmdName = this.aliases.get(inputCmd) || inputCmd
        const cmd = this.commands.get(cmdName)

        if (cmd && (await cmd.validate(msg, params))) {
            await cmd.run(msg, params)
        }
    }
}