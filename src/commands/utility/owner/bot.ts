import { Command, Category } from '../..'
import { Self } from '../../../Self'
import { Message } from 'discord.js'

export default class Bot extends Command {
    constructor(self: Self) {
        super({
            name: 'bot',
            category: Category.OwnerOnly,
            desc: 'Bot command for the owner',
            syntax: ['<options>'],
            aliases: [],
            perms: [],
            guild: false,
            botOwner: true,
            self,
        })
    }

    public async run(_: Message, params: string[]) {
        switch (params.shift()) {
            case "relog":
                process.env.TOKEN = params.shift() || process.env.TOKEN
                this.client.destroy()
                await this.client.login(process.env.TOKEN)
                break
        }
    }
}
