import { Self } from '../Self'

require('dotenv').config() // load .env if exists

const { BOT_NAME, BOT_PREFIX, TOKEN } = process.env
if (!BOT_NAME || !BOT_PREFIX || !TOKEN) {
    throw new Error("invalid env")
}
const self = new Self(BOT_NAME, BOT_PREFIX, TOKEN)

self.start()
