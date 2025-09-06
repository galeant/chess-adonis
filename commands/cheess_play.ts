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

      const cmd = game.validateCommand(input)
      if (!cmd) {
        console.log('Invalid input, use format a2,a3')
        continue
      }

      // if (game.isCheck(game.turn)) {
      //   console.log(`${turn} King is in check!`)
      //   continue
      // }

      const move = game.makeMove(cmd.from, cmd.to)
      if (!move.ok) {
        console.log('Invalid:', move.msg)
        continue
      }

      if (move?.promote) {
        let choice: string
        const valid = ['Q', 'R', 'B', 'N']

        do {
          choice = await ask(`${turn} pawn promotion! Choose (Q,R,B,N): `)
        } while (!valid.includes(choice))

        game.promotion(cmd.to, choice as 'Q' | 'R' | 'B' | 'N')
      }
    }

    rl.close()
  }
}
