import { Self } from '../../../Self'
import { Message } from 'discord.js'
import { Command, Category } from '../..'
import { PythonShell, PythonShellError } from 'python-shell'
import { MessageAccumulator } from '../../../utils'

export default class Python extends Command {
    constructor(self: Self) {
        super({
            name: 'python',
            category: Category.Coding,
            desc: 'Executes Python code directly on the bot.',
            syntax: ['<code>'],
            aliases: ['py'],
            perms: [],
            guild: false,
            // botOwner: true,
            self,
        })
    }
    private shells: Map<string, PythonShell> = new Map()

    public async run(msg: Message, params: string[]) {
        // if (msg.author.id !== BOT_OWNER) {
        //     if (!msg.member || !msg.member.roles.cache.some((r) => r.name === 'Coder')) return this.unauthorised(msg)
        // }
        // get code from content
        let code = params.join(' ').trim()
        if (code.startsWith('```') && code.endsWith('```')) {
            code = code.slice(3, -3)
            if (code.startsWith('python')) {
                code = code.slice(6)
            } else if (code.startsWith('py')) {
                code = code.slice(2)
            }
        }

        const prevSh = this.shells.get(msg.author.id)
        if (prevSh) {
            msg.channel.send('Terminating previous script')
            prevSh.emit('term')
            prevSh.kill()
        }
        const sh = new PythonShell('exec.py', { pythonOptions: ['-u'] })
        this.shells.set(msg.author.id, sh)

        sh.send(code) // load code into exec.py
        sh.send('\x04') // Ctrl+D to stop loading and exec
        const start = Date.now()

        let term: boolean = false
        let timedout: boolean = false
        this.client.setTimeout(() => {
            term = timedout = true
            sh.kill()
        }, 30000)
        const collector = msg.channel.createMessageCollector(m => m.author.id === msg.author.id)
        collector.on('collect', m => sh.send(m.content))

        const accumulator = new MessageAccumulator(msg.channel)
        accumulator.prepend('```prolog\n').append('```')
        sh.on('message', (output: string) => accumulator.send(output))
        sh.once('term', () => (term = true))
        sh.once('close', () => {
            const timeTaken = Date.now() - start
            accumulator.flush()
            collector.stop()
            this.shells.delete(msg.author.id)

            // send embed
            let verb: string
            if (timedout) {
                verb = 'timed out'
            } else if (term) {
                verb = 'terminated'
            } else {
                verb = 'ended'
            }
            const embed = this.embed()
                .setDescription(`[Script](${msg.url}) ${verb}.`)
                .setFooter(`Time taken: ${timeTaken}ms`)
            msg.channel.send(embed)
        })
        sh.once('error', (err: PythonShellError) => {
            msg.channel.send(err.traceback, { code: 'prolog' })
        })
    }
}
