import {
    User,
    Message,
    MessageEmbed,
    CollectorFilter,
    MessageReaction,
} from 'discord.js'
import { Command, Category } from '../'
import { CooldownTracker } from '../../utils'
import BattleshipGrid from './battleship/'
import { Self } from '../../Self'

const DisplayOpts = Object.freeze({
    empty: '⬛',
    hit: '⭕',
    miss: '❌',
    ships: Object.freeze(['⬜', '🟥', '🟪', '🟧', '🟩', '🟫', '🟦']),
    target: '📌',
})

// const Numbers = new Collection([
//     ['1️⃣', 0],
//     ['2️⃣', 1],
//     ['3️⃣', 2],
//     ['4️⃣', 3],
//     ['5️⃣', 4],
//     ['6️⃣', 5],
//     ['7️⃣', 6],
//     ['8️⃣', 7],
//     ['9️⃣', 8],
//     ['🔟', 9],
// ])

const CoordinateCollectorOptions = Object.freeze({
    max: 1,
    time: 5 * 60000,
    errors: ['time'],
})

function FilterCoordinates(player: User) {
    return (m: Message) => {
        if (player.id !== m.author.id) return false
        const xy = m.content.split(' ').filter((n) => n !== '')
        if (xy.length !== 2) return false
        return valid1to10(xy[0]) && valid1to10(xy[1])
    }
}

function valid1to10(str: string) {
    const n = +str
    return Number.isInteger(n) && n >= 1 && n <= 10
}

// const ReactNumbers = async (sent: Message) => {
//     const p: Promise<MessageReaction>[] = []
//     Numbers.forEach((i, emote) => (p[i] = sent.react(emote)))
//     await Promise.all(p)
//     return sent
// }

export default class BattleShip extends Command {
    private playing: Map<string, null>
    private cooldown: CooldownTracker
    constructor(self: Self) {
        super({
            name: 'battleship',
            category: Category.Games,
            desc: 'Plays battleship with another user.',
            syntax: ['<user>'],
            aliases: [],
            perms: [],
            guild: false,
            self,
        })
        this.playing = new Map()
        this.cooldown = new CooldownTracker()
    }

    getGridEmbed(
        ownGrid: BattleshipGrid,
        theirGrid: BattleshipGrid,
        ownTurn: boolean,
        hit: boolean
    ) {
        return new MessageEmbed()
            .setColor('RANDOM')
            .setTitle('Battleship ' + (ownTurn ? '(Your Turn)' : '(Their Turn)'))
            .addField('Their Board:', theirGrid.display(DisplayOpts, false), true)
            .addField('Your Board:', ownGrid.display(DisplayOpts, true), true)
            .setFooter(hit ? `${ownTurn ? 'You got' : ''} Hit!` : '')
    }

    async startGame(p0: User, p1: User) {
        const ps = [p0, p1]
        const gs = [new BattleshipGrid(), new BattleshipGrid()]
        gs[0].spawnAll()
        gs[1].spawnAll()

        let ms = [
            await ps[0].send({ embeds: [this.getGridEmbed(gs[0], gs[1], true, false)] }),
            null,
        ]

        let p = 0,
            hit = false
        while (gs[p].alive) {
            ms = await Promise.all([
                ms[p]!.edit({ embeds: [this.getGridEmbed(gs[p], gs[p ^ 1], true, hit)] }), // next player's turn
                ps[p ^ 1].send({ embeds: [this.getGridEmbed(gs[p ^ 1], gs[p], false, hit)] }), // prev player's turn
            ])
            const res = await ps[p].dmChannel!.awaitMessages(
                {
                    filter: FilterCoordinates(ps[p]),
                    ...CoordinateCollectorOptions,
                }
            )
            ms[p]!.delete()
            const [x, y] = res.first()!.content.split(' ')
            hit = gs[p ^ 1].fireAt(+x - 1, +y - 1)
            p ^= 1 // switch to next player
        }
    }

    // Requests player2's permission to play
    async requestPlayer2(msg: Message, p1: User, p2: User) {
        const embed = new MessageEmbed()
            .setDescription(`${p2}, **${p1.tag}** invited you to a battleship game!`)
            .setFooter('✅ to accept, ❌ to reject.')
            .setColor('RANDOM')
        const reply = await msg.channel.send({ embeds: [embed] })
        reply.react('✅')
        reply.react('❌')

        const filter: CollectorFilter<[MessageReaction, User]> = (reaction, user) =>
            user.id === p2.id && ['✅', '❌'].includes(reaction.emoji.name || '')
        const collected = await reply.awaitReactions({
            filter,
            max: 1,
            idle: 15000,
        })
        if (collected.size === 0 || collected.first()!.emoji.name === '❌') {
            this.cooldown.set(p1, 15000)
            embed
                .setDescription(`**${p2.tag}** has rejected your invitation.`)
                .setFooter('')
            await reply.edit({ embeds: [embed] })
            await new Promise(r => setTimeout(r, 7000));
            await reply.delete()
            return false
        }
        reply.delete()
        return true
    }

    public async run(msg: Message, params: string[]) {
        const p1 = msg.author
        // if (this.cooldown.has(player1)) {
        //     return this.cooldown.sendCooldown(player1, msg.channel)
        // }
        // if (this.playing.has(player1)) {
        //     return msg.channel.send(`You are currently playing a game of battleship!`)
        // }

        const p2id = this.helpers.resolveMention(params[0], 'user')
        const p2 = await msg.client.users.fetch(p2id)
        // if (this.playing.has(player2)) {
        //     return msg.channel.send(`**${p2.tag}** is currently playing a game of battleship`)
        // }
        // const accepted = await this.requestPlayer2(msg, player1, player2)
        // if (!accepted) return

        // multiple invitations may cause this
        if (this.playing.has(p1.id) || this.playing.has(p2.id)) return
        this.playing.set(p1.id, null)
        this.playing.set(p2.id, null)

        await this.startGame(p1, p2)
        this.playing.delete(p1.id)
        this.playing.delete(p2.id)
    }
}
