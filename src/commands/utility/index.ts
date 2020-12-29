import Ban from './moderation/ban'
import Unban from './moderation/unban'
import Kick from './moderation/kick'
import Clear from './moderation/clear'
import Eval from './owner/eval'
import Help from './help'
import Ping from './ping'
import Python from './coding/python'
import CPP from './coding/cpp'
import React from './react'
import Bot from './owner/bot'

export const CommandList = {
    ban: Ban,
    unban: Unban,
    kick: Kick,
    clear: Clear,
    eval: Eval,
    help: Help,
    ping: Ping,
    python: Python,
    cpp: CPP,
    react: React,
    bot: Bot,
}
