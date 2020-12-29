import { Self } from '../../../Self'
import { Message } from 'discord.js'
import { Command, Category } from '../..'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { MessageAccumulator } from '../../../utils'

export default class CPP extends Command {
    constructor(self: Self) {
        super({
            name: 'cpp',
            category: Category.Coding,
            desc: 'Compiles and runs C++ code on the bot.',
            syntax: ['<code>'],
            aliases: ['c++'],
            perms: [],
            guild: false,
            // botOwner: true,
            self,
        })
        this.cleanup()
    }

    async cleanup() {
        fs.mkdir('exec', { recursive: true })
        const files = await fs.readdir('exec')
        files.forEach(file => fs.unlink('exec/' + file))
    }

    private async compile(code: string, filename: string): Promise<string> {
        return new Promise(resolve => {
            const compiler = spawn('g++', ['-x', 'c++', '-o', 'exec/' + filename, '-'])
            compiler.stdin.write(code, err => {
                if (err) return console.error(err)
                compiler.stdin.end()
            })
            const chunks: any = []
            compiler.stderr.on('data', chunk => chunks.push(chunk))
            compiler.stderr.once('end', () => {
                const stderr = Buffer.concat(chunks).toString()
                resolve(stderr)
            })
            compiler.once('error', console.error)
        })
    }

    public async run(msg: Message, params: string[]) {
        // if (msg.author.id !== BOT_OWNER) {
        //     if (!msg.member || !msg.member.roles.cache.some((r) => r.name === 'Coder')) return this.unauthorised(msg)
        // }
        let code = params.join(' ')
        if (code.startsWith('```') && code.endsWith('```')) {
            code = code.slice(3, -3)
            if (code.startsWith('c++') || code.startsWith('cpp')) {
                code = code.slice(3)
            }
        }
        const t1 = Date.now()
        const stderr = await this.compile(code, msg.author.id)
        const t2 = Date.now()

        if (stderr.length !== 0) {
            const embed = this.embed()
                .setDescription('```prolog\n' + stderr + '```')
                .setFooter(`Compilation failed | Time taken: ${t2 - t1}ms`)
            msg.channel.send(embed)
            return
        }
        const collector = msg.channel.createMessageCollector(m => m.author.id === msg.author.id)
        const accumulator = new MessageAccumulator(msg.channel)
        accumulator.setDelimiter('').prepend('```prolog\n').append('```')

        const program = spawn('exec/' + msg.author.id)

        collector.on('collect', m => program.stdin.write(m.content + '\n'))

        program.stdout.on('data', (chunk: Buffer) => accumulator.send(chunk.toString()))
        program.stdout.once('end', () => {
            const t3 = Date.now()
            accumulator.flush()
            collector.stop()
            const embed = this.embed()
                .setDescription(`[Program](${msg.url}) ended.`)
                .setFooter(`Compile time taken: ${t2 - t1}ms | Program time taken: ${t3 - t2}ms`)
            msg.channel.send(embed)
        })
    }
}
