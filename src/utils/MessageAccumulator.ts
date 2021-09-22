import { TextChannel, DMChannel, NewsChannel, MessageEmbed, TextBasedChannels } from 'discord.js'

export default class MessageAccumulator {
    constructor(
        public channel: TextBasedChannels,
    ) { }
    private queue: string = ''
    private delimiter: string = '\n'
    private prefix: string = ''
    private postfix: string = ''
    private time: number = 50
    private sendFn: (content: string) => void = (content) => {
        this.channel.send(content)
    }
    public embed: MessageEmbed | null = null

    public setTimeout(ms: number) {
        this.time = ms
        return this
    }

    private timeout: NodeJS.Timeout = setTimeout(() => this.flush(), this.time)

    public send(content: string) {
        this.queue += content + this.delimiter
        this.timeout.refresh()
    }

    public amend(fn: (content: string) => void) {
        this.sendFn = fn
        return this
    }

    public flush() {
        if (this.queue === '') return
        this.sendFn(this.prefix + this.queue + this.postfix)
        this.queue = ''
    }

    public setDelimiter(delimiter: string) {
        this.delimiter = delimiter
        return this
    }

    public prepend(prefix: string) {
        this.prefix = prefix
        return this
    }

    public append(postfix: string) {
        this.postfix = postfix
        return this
    }
}

export class EmbedAccumulator extends MessageAccumulator {
    constructor(channel: TextChannel | DMChannel | NewsChannel) {
        super(channel)
    }

}