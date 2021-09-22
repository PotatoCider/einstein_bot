import { Command, Category } from '../..'
import { Self } from '../../../Self'
import { Message } from 'discord.js'

export default class Config extends Command {
    constructor(self: Self) {
        super({
            name: 'config',
            category: Category.Moderation,
            desc: 'Change guild config',
            syntax: ['<key> [value]'],
            aliases: [],
            perms: ['ADMINISTRATOR'],
            guild: true,
            self,
        })
    }

    public async run(msg: Message, params: string[]) {
        const key = params.shift()
        const value = params.join(' ')
        switch (key) {
            case 'welcome':
                this.welcome(msg, value)
                break
            case 'whitelist':
                this.whitelist(msg, value)
                break
            default:
                return this.invalid(msg, 'no such config')
        }
    }

    async whitelist(_msg: Message, _value: string) {
        // const key = `guilds:${msg.guild!.id}:whitelist`
    }

    async welcome(msg: Message, value: string) {
        const configKey = `guilds:${msg.guild!.id}:config`
        const welcomeCh = await this.redis.hget(configKey, 'welcome')

        switch (value) {
            case '':
                msg.channel.send(`Welcome is ${welcomeCh ? `enabled in <#${welcomeCh}>` : 'disabled'}`)
                return
            case 'disable':
            case 'disabled':
            case 'off':
                if (welcomeCh) {
                    this.redis.hdel(configKey, 'welcome')
                    msg.channel.send('Welcome is now off')
                } else {
                    msg.channel.send('Welcome is already off')
                }
                return
        }

        const channelID = this.helpers.resolveMention(value)
        const channel = msg.guild!.channels.resolve(channelID)
        if (channel && channel.isText) {
            this.redis.hset(configKey, 'welcome', channel.id)
            msg.channel.send(`Welcome is now enabled in ${channel}`)
        } else {
            this.invalid(msg, 'Invalid text channel (`config welcome #channel/off`)')
        }
    }
}
