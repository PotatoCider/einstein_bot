import { Client, ClientEvents } from "discord.js"
import { Redis } from "ioredis"
import { Self } from "../Self"

export type BoundHandler<K extends keyof ClientEvents> = (...args: ClientEvents[K]) => void

export default abstract class Handler<K extends keyof ClientEvents>{
    public bounded: BoundHandler<K>[] = []
    protected redis: Redis
    protected client: Client
    constructor(protected self: Self, public readonly event: K) {
        this.redis = this.self.redis
        this.client = this.self.client
        self.client.on(event, (...args) => this.run(...args))
    }

    public bind(fn: (...args: ClientEvents[K]) => void) {
        this.bounded.push(fn)
        this.client.on(this.event, fn)
    }

    abstract run(...args: ClientEvents[K]): void
}
