
const SQUARE_EMPTY = 'E'
const SQUARE_HIT = 'H'
const SQUARE_MISS = 'M'
// const SQUARE_TARGET = 'T'
// const SMALLEST_SHIP = '2'

type Square = string | Ship
/**
 * returns a random integer from 0 to max-1 (excluded max)
 */
function randn(max: number) {
    return Math.floor(Math.random() * max)
}

/**
 * Traverses the strip around the target to find a occupied square
 * Returns the number of empty squares around a target &
 * Returns the indices of encountered occupied squares
 */
function getEmptySpaces(strip: Square[], index: number) {
    if (strip[index] !== SQUARE_EMPTY) return { empty: 0, left: 0, right: 0 }
    let l = index,
        r = index
    for (; l >= 0; l--) {
        if (strip[l] !== SQUARE_EMPTY) {
            break
        }
    }
    l++ // go back to prev empty square
    for (; r < strip.length; r++) {
        if (strip[r] !== SQUARE_EMPTY) {
            break
        }
    }
    r-- // go back to prev empty square
    return {
        left: l,
        right: r,
        empty: r - l + 1, // empty spaces
    }
}

export default class BattleshipGrid {
    private grid: Square[][] = []
    private dimX: number = 10
    private dimY: number = 10
    private ships: number = 0
    // private shipSquares: number = 0
    constructor() {
        this.resetGrid()
    }

    get alive() {
        return this.ships > 0
    }

    spawnAll(sizes: number[] = [2, 2, 3, 3, 4, 4, 5]) {
        sizes.forEach((size) => this.spawnShip(size))
    }

    resetGrid() {
        for (let i = 0; i < 10; i++) {
            this.grid[i] = []
            for (let j = 0; j < 10; j++) {
                this.grid[i][j] = SQUARE_EMPTY
            }
        }
        return this.grid
    }

    display(
        o: {
            empty: string
            hit: string
            miss: string
            ships: readonly string[] /*, targetXY: number[]*/
            target: string
        },
        showShips: boolean
    ) {
        return this.grid.map((row) =>
            row.map((sq) => {
                // if (targetXY && targetXY[0] === x && targetXY[1] === y) {
                //     return target
                // }
                switch (sq) {
                    case SQUARE_EMPTY:
                        return o.empty
                    case SQUARE_MISS:
                        return o.miss
                    case SQUARE_HIT:
                        return o.hit
                }
                if (!(sq instanceof Ship)) throw new Error('sq is not ship')
                return showShips ? o.ships[sq.id] : o.empty
            }).join('')
        ).join('\n')
    }

    /**
     * Attempts to hit a ship at (x, y).
     * Returns true if hit
     */
    fireAt(x: number, y: number) {
        const sq = this.grid[y][x]
        if (sq instanceof Ship) {
            const sunk = sq.hit()
            if (sunk) {
                this.ships--
            }
            this.grid[y][x] = SQUARE_HIT
            return true
        } else {
            this.grid[y][x] = SQUARE_MISS
            return false
        }
    }

    // Spawns a ship at random (x, y)
    spawnShip(size: number) {
        let horizontal, empty, left, x: number, y
        // find valid spot
        while (true) {
            x = randn(this.dimX)
            y = randn(this.dimY)
            if (this.grid[y][x] !== SQUARE_EMPTY) continue
            const hStrip = this.grid[y]
            const vStrip = this.grid.map((hStrip) => hStrip[x])
            const strips = [hStrip, vStrip]
            const targets = [x, y]
            let n = randn(2)

            horizontal = !n
                ; ({ empty, left } = getEmptySpaces(strips[n], targets[n]))
            if (empty >= size + 2) break

            n ^= 1
            horizontal = !horizontal
                ; ({ empty, left } = getEmptySpaces(strips[n], targets[n]))
            if (empty >= size + 2) break

            // spot is not valid. Possible optimisation to store invalid crosshair of spots from this spot?
        }

        // place ship
        const offset = randn(empty - size) + 1
        this.placeShip(left + offset, horizontal ? y : x, size, horizontal)
    }

    // Assumes that ship can be placed
    // k is the fixed x|y component of the ship
    placeShip(start: number, k: number, size: number, horizontal: boolean) {
        const ship = new Ship(size, this.ships)
        this.ships++
        // this.shipSquares += size

        if (horizontal) {
            for (let i = start; i < start + size; i++) {
                this.grid[k][i] = ship
            }
        } else {
            for (let i = start; i < start + size; i++) {
                this.grid[i][k] = ship
            }
        }
    }
}

class Ship {
    public id: number
    public size: number
    public sink: boolean
    private hitSq: number

    // id is an integer
    constructor(size: number, id: number) {
        this.size = size
        this.id = id
        this.hitSq = 0
        this.sink = false
    }

    // Returns true if ship sunk
    hit() {
        this.hitSq++
        if (this.hitSq === this.size) {
            this.sink = true
            return true
        }
        return false
    }
}

// module.exports = class BattleshipGame {
//     constructor() {
//         this.p1 = new BattleshipGrid(this)
//         this.p2 = new BattleshipGrid(this)
//         this.p1.spawnAll()
//         this.p2.spawnAll()
//     }
// }
