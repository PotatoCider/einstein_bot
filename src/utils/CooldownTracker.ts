import { User, TextChannel } from 'discord.js'

export interface UserCooldown {
    user: User
    end: number
    timer: NodeJS.Timer
    timeLeft: () => number
    secsLeft: () => number
}
export default class CooldownTracker {
    private map: Map<User, UserCooldown>
    constructor() {
        this.map = new Map()
    }

    // Sets a cooldown on a user for this command
    public set(user: User, t: number) {
        const now = Date.now()
        const timer = user.client.setTimeout(() => this.map.delete(user), t)

        const cd: UserCooldown = {
            user,
            timer,
            end: now + t,
            timeLeft() {
                return cd.end - Date.now()
            },
            secsLeft() {
                return Math.ceil(cd.timeLeft() / 1000)
            },
        }
        this.map.set(user, cd)
    }

    async sendCooldown(user: User, channel: TextChannel) {
        const cd = this.map.get(user)
        if (!cd) return console.warn('sendCooldown: user not on cooldown')
        const sent = await channel.send(
            `You're on cooldown. ${cd.secsLeft()}s left.`
        )
        user.client.setTimeout(() => sent.delete(), cd.timeLeft())
        return sent
    }
}
