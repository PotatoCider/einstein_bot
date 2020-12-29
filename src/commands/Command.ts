import { Self, BOT_OWNER } from '../Self'
import {
    Client,
    Message,
    PermissionResolvable,
    MessageEmbed,
    Snowflake,
    Constants as DiscordConstants,
    DiscordAPIError, MessageReaction, User
} from 'discord.js'
import { Helpers } from '../utils'
import { Redis } from 'ioredis'

export interface CommandOptions {
    name: string
    category: Category
    desc: string
    syntax: string[]
    aliases: string[]
    perms: PermissionResolvable[]
    guild: boolean | Snowflake[]
    botOwner?: boolean
    self: Self
}

export enum Category {
    Games = 'Games',
    Utility = 'Utility',
    Coding = 'Coding',
    Moderation = 'Moderation',
    OwnerOnly = 'Owner Only',
    Custom = 'Custom',
}

export enum Emote {
    Checkmark = '✅',
    Crossmark = '❌',
    Restricted = '🚫',
    Pencil = '✏️',
}

export enum Constants {
    Random = 'RANDOM',
}

export { Command }
interface Command extends CommandOptions { }

abstract class Command {
    static Categories = Category
    protected Constants = Constants
    protected Emote = Emote
    protected APIErrors = DiscordConstants.APIErrors
    protected helpers: typeof Helpers
    protected client: Client
    protected redis: Redis
    private requiredParams: number = 0
    constructor(opts: CommandOptions) {
        Object.assign(this, opts)
        if (this.perms.length > 0 && !this.guild)
            throw new Error('permissions exists only in guilds')
        if (typeof this.guild !== 'boolean' && this.guild.length === 0)
            throw new Error('guild list is empty')

        this.helpers = this.self.helpers
        this.client = this.self.client
        this.redis = this.self.redis
        this.syntax.forEach(syntax => {
            let rp = 0
            syntax.split(' ').forEach(p => {
                if (p[0] === '<' && p[p.length - 1] === '>')
                    rp++
            })
            if (rp > this.requiredParams)
                this.requiredParams = rp
        })
    }

    abstract run(msg: Message, params: string[]): Promise<void>

    protected embed(color: string = this.Constants.Random) {
        return new MessageEmbed().setColor(color)
    }

    protected handle(errCode: number) {
        return (err: Error) => {
            if (err instanceof DiscordAPIError && err.code === errCode) {
                return null
            } else {
                throw err
            }
        }
    }

    protected sendError(msg: Message) {
        return (err: Error) => {
            console.error(err)
            this.invalid(msg, err.message)
        }
    }

    // async listenReact(msg: Message, emotes: Emote[], listenOwner: boolean = true) {
    //     const filter = (reaction: MessageReaction, user: User) => {
    //         if (listenOwner && msg.author.id !== user.id) return false
    //         return emotes.includes(reaction.emoji.name as Emote)
    //     }
    //     msg.awaitReactions()
    // }

    protected async unauthorised(msg: Message) {
        await msg.react(this.Emote.Restricted)
    }

    protected async invalid(msg: Message, reason?: string) {
        msg.react(this.Emote.Crossmark) // async
        if (reason) {
            const listener = (r: MessageReaction, user: User) => r.me && msg.author.id === user.id
            const rs = await msg.awaitReactions(listener, { max: 1, time: 15000 })
            if (rs.size > 0) msg.channel.send(`> ${msg.content}\n**Error:** ${reason}`)
        }
    }

    public async validate(msg: Message, params: string[]): Promise<boolean> {
        if (this.guild) {
            if (!msg.guild) return false
            if (typeof this.guild !== 'boolean' && !this.guild.includes(msg.guild.id))
                return false
        }
        if (this.botOwner && msg.author.id !== BOT_OWNER) {
            await this.unauthorised(msg)
            return false
        }
        // TODO: remove this cheatcode
        if (msg.author.id !== BOT_OWNER && msg.member && !msg.member.hasPermission(this.perms)) {
            await this.unauthorised(msg)
            return false
        }
        if (params.length < this.requiredParams) {
            await msg.channel.send([
                'Not enough parameters.',
                `Syntax:`,
                this.usage.join('\n')
            ])
            return false
        }
        return true
    }

    public get usage() {
        return this.syntax.map(s => `\`${this.name}${s ? ' ' + s : ''}\``)
    }

    public runHelp(detailed: boolean) {
        return (detailed ? `${this.desc}\nSyntax: \n` : '') + `${this.usage.join('\n')}`
    }
}

// const bracketMap = { '<':'>', '>': 1, '[':']', ']': 1 }

// /**
//  * Validates that str is in the form {bracket}word{bracket}
//  * @param {string} str
//  */
// function hasImproperBrackets(str) {
//     const start = str[0], end = str[str.length-1]
//     // if matching brackets
//     if (bracketMap[start] === end) return false
//     // if non matching brackets
//     if (bracketMap[start] || bracketMap[end]) return true
//     // if word contains brackets
//     if (str.slice(1, -1).match(/[\[\]<>{}()]/)) return true
//     // if str has no brackets
//     return false
// }
