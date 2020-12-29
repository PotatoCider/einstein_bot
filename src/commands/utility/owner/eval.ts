import { Self } from '../../../Self'
import { Message, PartialMessage } from 'discord.js'
import { Command, Category } from '../..'

export default class Eval extends Command {
    constructor(self: Self) {
        super({
            name: 'eval',
            category: Category.OwnerOnly,
            desc: 'Executes Node.js code directly on the bot.',
            syntax: ['<code>'],
            aliases: ['js'],
            perms: [],
            guild: false,
            botOwner: true,
            self,
        })
    }

    private getPrinter(sent: Message) {
        let append = false
        return (content: string) => {
            content = '```prolog\n' + content + '```'
            if (append) {
                content = sent.content + content
            }
            sent.edit(content)
            sent.content = content
            append = true
        }
    }

    private eval(code: string, msg: Message, print: (content: string) => void) {
        if (code.startsWith('```') && code.endsWith('```')) {
            const hasJS = code.startsWith('```js')
            code = code.slice(hasJS ? 5 : 3, -3)
        }
        eval(`(async () => {
            ${code}
            await msg.react(this.Emote.Checkmark)
        })().catch(err => {
            print(err.toString())
            console.warn(err)
        })`)
        msg
        print // fix lint
    }

    // TODO: Use MessageAccumulator
    public async run(msg: Message, params: string[], sent?: Message) {
        let code = params.join(' ')

        if (!sent) sent = await msg.channel.send('running...', { code: 'prolog' })
        this.eval(code, msg, this.getPrinter(sent))
        const handler = (_: Message | PartialMessage, newMsg: Message | PartialMessage) => {
            if (newMsg.id !== msg.id || newMsg.partial) return
            const params = newMsg.content.split(' ')
            params.shift()
            this.run(newMsg, params, sent)
            this.client.removeListener('messageUpdate', handler)
        }
        this.client.on('messageUpdate', handler)
    }
}
