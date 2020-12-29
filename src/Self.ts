import { Client } from 'discord.js'

import { Commands, Command } from './commands'
import { HandlerList } from './handlers'
import IORedis, { Redis } from 'ioredis'
import { Helpers, CooldownTracker } from './utils'

export const BOT_OWNER = '250140362880843776'

export class Self {
    public client: Client = new Client()
    public redis: Redis = new IORedis()
    public commands: Map<string, Command> = new Map()
    public aliases: Map<string, string> = new Map()
    public handlers: Map<string, any> = new Map()
    // public guilds: Map<string, Guild> = new Map()
    public cooldown: CooldownTracker = new CooldownTracker()
    public helpers = Helpers
    private initResolve: Function = () => { }
    public init: Promise<void> = new Promise((r) => (this.initResolve = r))

    constructor(public name: string, public prefix: string, private token: string) { }

    private async loadCommands() {
        for (let name of Object.keys(Commands) as Array<keyof typeof Commands>) {
            const cmd = new Commands[name](this)
            this.commands.set(cmd.name, cmd)

            cmd.aliases.forEach((alias) => this.aliases.set(alias, cmd.name))

        }
    }

    private async loadHandlers() {
        HandlerList.forEach((handlerClass) => {
            const handler = new handlerClass(this)
            this.handlers.set(handler.event, handler)
        })
    }

    public async start() {
        await Promise.all([
            this.loadCommands(),
            this.loadHandlers(),
            this.client.login(this.token),
        ])

        console.log('All systems are go!')
        this.initResolve()
    }
}