import { Guild } from "discord.js"
import { PremiumTier } from "discord.js"

const slots: { [K in PremiumTier]: number } = {
    NONE: 50,
    TIER_1: 100,
    TIER_2: 150,
    TIER_3: 250,
}

const Helpers = {
    // resolveMentions
    resolveMention(mention: string, type: string = '') {
        let match
        switch (type) {
            case 'user':
                match = mention.match(/<@!?(\d{17,19})>/)
                break
            case 'role':
                match = mention.match(/<@&(\d{17,19})>/)
                break
            case 'channel':
                match = mention.match(/<#(\d{17,19})>/)
                break
            case '':
                match = mention.match(/<(?:#|@(?:&|!)?)(\d{17,19})>/)
                break
            default:
                throw new Error('invalid type: ' + type)
        }
        return match ? match[1] : mention
    },
    // total includes animated emojis
    getAvailableEmoteSlots(guild: Guild, total = false) {
        return slots[guild.premiumTier] - guild.emojis.cache.filter(e => total || !e.animated).size
    }
}

export default Helpers
