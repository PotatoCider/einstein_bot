import { Command, Category } from '../..'
import { Self } from '../../../Self'
import { Message } from 'discord.js'

export default class Config extends Command {
    constructor(self: Self) {
        super({
            name: 'config',
            category: Category.Moderation,
            desc: 'Change guild config',
            syntax: ['<key> <value>'],
            aliases: [],
            perms: ['ADMINISTRATOR'],
            guild: true,
            self,
        })
    }

    public async run(msg: Message, params: string[]) {
        const key = params.shift()
        const value = params.join(' ').toLowerCase()
        switch (key) {
            case 'welcome':
                this.welcome(msg, value)
                break
            default:
                return this.invalid(msg, 'no such config')
        }
    }

    async welcome(msg: Message, value: string) {
        const configKey = `guilds:${msg.guild!.id}:config`
        const isWelcomeEnabled = !!(await this.redis.hexists(configKey, 'welcome'))

        let toEnable: boolean
        switch (value) {
            case 'toggle':
                toEnable = !isWelcomeEnabled
                break
            case 'on':
                toEnable = true
                break
            case 'off':
                toEnable = false
                break
            default:
                this.invalid(msg, 'Proper syntax: `config welcome [on/off/toggle(default)]`')
                return
        }
        if (toEnable === isWelcomeEnabled) {
            msg.channel.send(`Welcome is already ${toEnable ? 'on' : 'off'}`)
            return
        }

        if (toEnable) {
            this.redis.hset(configKey, 'welcome', '1')
        } else {
            this.redis.hdel(configKey, 'welcome')
        }

        msg.channel.send(`Welcome is now ${toEnable ? 'on' : 'off'}`)
    }
}
