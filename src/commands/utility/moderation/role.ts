import { Message } from "discord.js";
import { Self } from "../../../Self";
import { Category, Command } from "../../Command";


export default class Role extends Command {
    constructor(self: Self) {
        super({
            name: 'role',
            category: Category.Moderation,
            desc: 'Manages the roles of a guild member.',
            syntax: [
                '<member> <role> [reason]',
                'react <message> <emote1> <role1> [emote2] [role2] ... [emoteN] [roleN]'
            ],
            aliases: [],
            perms: ['MANAGE_ROLES'],
            guild: true,
            self,
        })
    }

    async run(msg: Message, params: string[]) {
        msg
        params
    }
}