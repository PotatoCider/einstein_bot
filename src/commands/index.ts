export { Command, CommandOptions, Category } from './Command'
import { CommandList as Games } from './games'
import { CommandList as Utility } from './utility'
import { CommandList as Custom } from './custom'

export const Commands = {
    ...Games,
    ...Utility,
    ...Custom,
}
