import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import ChessGame from '#services/chess_game'
import * as readline from 'node:readline'

export default class CheessPlay extends BaseCommand {
  static commandName = 'cheess:play'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    const game = new ChessGame()
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const ask = (q: string) =>
      new Promise<string>((resolve) => rl.question(q, (ans) => resolve(ans.trim())))

    this.logger.info('Console Chess Game (Adonis 6)')
    while (true) {
      console.log('\n' + game.displayBoard())
      const status = game.checkForWin()
      if (status.finished) {
        this.logger.info(`Game Over! Winner: ${status.winner}`)
        break
      }

      const turn = game.turn === 'w' ? 'White' : 'Black'
      const input = await ask(`${turn} move > `)
      if (input === 'exit') {
        break
      }

      const move = game.validateCommand(input)
      if (!move) {
        console.log('Invalid input, use format e2e4')
        continue
      }
      const res = game.makeMove(move.from, move.to)
      if (!res.ok) console.log('Invalid:', res.msg)
    }

    rl.close()
  }
}
