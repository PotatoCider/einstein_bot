// import { Guild, GuildMember, Snowflake, User } from "discord.js";
// import { Redis } from "ioredis";

// type GuildID = Snowflake | Guild
// type MemberID = Snowflake | User | GuildMember

// interface GuildMemberInfo {
//     welcomed: boolean
// }

// interface GuildConfig {
//     welcome: boolean
// }

// export class GuildRedis {
//     constructor(private redis: Redis) { }

//     private async hget(guildID: GuildID, memberID: MemberID) {
//         if (guildID instanceof Guild) guildID = guildID.id
//         if (memberID instanceof GuildMember || memberID instanceof User) memberID = memberID.id


//     }

//     async members(guildID: Snowflake, memberID: Snowflake): Promise<GuildMemberInfo> {
//         const memberJSON = await this.redis.hget(`guilds:${guildID}:members`, memberID)
//         if (!memberJSON) return {
//             welcomed: false
//         }
//         return JSON.parse(memberJSON)
//     }

//     async config(guildID: Snowflake, key: string): Promise<GuildConfig> {
//         const configJSON = await this.redis.hget(`guilds:${guildID}:config`, key)
//         if (!configJSON) return {
//             welcome: false
//         }
//         return JSON.parse(configJSON)
//     }
// }