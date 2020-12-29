import { GuildMember } from "discord.js"
import { Handler } from "."
import { Self } from "../Self"


export default class GuildMemberAdd extends Handler<'guildMemberAdd'> {
    constructor(self: Self) {
        super(self, 'guildMemberAdd')
    }

    async run(member: GuildMember) {

    }
}