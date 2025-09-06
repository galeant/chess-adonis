import { test } from '@japa/runner'
import ChessGame, { Color } from '#services/chess_game'
import { Assert } from '@japa/assert'

const move = (
  game: ChessGame,
  assert: Assert,
  from: { r: number; c: number },
  to: { r: number; c: number },
  expected: boolean,
  turn: Color
) => {
  game.turn = turn
  const result = game.makeMove(from, to)
  // console.log(result)
  // console.log('\n' + game.displayBoard())
  assert.equal(result.ok, expected)
}

test.group('Chess test', () => {
  test('init board', async ({ assert }) => {
    const game = new ChessGame()
    assert.equal(game.board.length, 8)

    game.board.forEach((b) => {
      assert.equal(b.length, 8)
    })

    // Check all piece position
    // White
    assert.deepEqual(game.board[7][4], { type: 'K', color: 'w' }) // King
    assert.deepEqual(game.board[7][3], { type: 'Q', color: 'w' }) // Queen
    assert.deepEqual(game.board[7][2], { type: 'B', color: 'w' }) // Baron
    assert.deepEqual(game.board[7][5], { type: 'B', color: 'w' }) // Baron
    assert.deepEqual(game.board[7][1], { type: 'N', color: 'w' }) // Knight
    assert.deepEqual(game.board[7][6], { type: 'N', color: 'w' }) // Knight
    assert.deepEqual(game.board[7][0], { type: 'R', color: 'w' }) // Rook
    assert.deepEqual(game.board[7][7], { type: 'R', color: 'w' }) // Rook

    game.board[6].forEach((b) => {
      assert.deepEqual(b, { type: 'P', color: 'w' }) // Pawn
    })

    // black
    assert.deepEqual(game.board[0][4], { type: 'K', color: 'b' }) // King
    assert.deepEqual(game.board[0][3], { type: 'Q', color: 'b' }) // Queen
    assert.deepEqual(game.board[0][2], { type: 'B', color: 'b' }) // Baron
    assert.deepEqual(game.board[0][5], { type: 'B', color: 'b' }) // Baron
    assert.deepEqual(game.board[0][1], { type: 'N', color: 'b' }) // Knight
    assert.deepEqual(game.board[0][6], { type: 'N', color: 'b' }) // Knight
    assert.deepEqual(game.board[0][0], { type: 'R', color: 'b' }) // Rook
    assert.deepEqual(game.board[0][7], { type: 'R', color: 'b' }) // Rook

    game.board[1].forEach((b) => {
      assert.deepEqual(b, { type: 'P', color: 'b' }) // Pawn
    })
  })

  test('win condition (king capture)', async ({ assert }) => {
    const game = new ChessGame()

    // Dummy position
    game.board[0][4] = { type: 'K', color: 'b' } // Black King
    game.board[1][4] = { type: 'Q', color: 'w' } // White Queen

    const move = game.makeMove({ r: 1, c: 4 }, { r: 0, c: 4 })
    assert.isTrue(move.ok)

    const status = game.checkForWin()
    assert.equal(status.finished, true)
    assert.equal(status.winner, 'White')
  })

  test('test pawn moves', ({ assert }) => {
    const game = new ChessGame()
    // White
    // 1 step forward
    move(game, assert, { r: 6, c: 0 }, { r: 5, c: 0 }, true, 'w')

    // 2 steps from starting position
    move(game, assert, { r: 6, c: 1 }, { r: 4, c: 1 }, true, 'w')

    // Reverse move (backwards) not allowed
    move(game, assert, { r: 4, c: 1 }, { r: 5, c: 1 }, false, 'w')

    // 2 steps in enemy field not allowed
    move(game, assert, { r: 4, c: 1 }, { r: 2, c: 1 }, false, 'w')

    // Black
    // 2 steps forward
    move(game, assert, { r: 1, c: 2 }, { r: 3, c: 2 }, true, 'b')

    // Reverse move (backwards) not allowed
    move(game, assert, { r: 3, c: 2 }, { r: 2, c: 2 }, false, 'b')

    // Capture
    move(game, assert, { r: 4, c: 1 }, { r: 3, c: 2 }, true, 'w')
  })

  test('test rook moves', ({ assert }) => {
    const game = new ChessGame()

    // Block
    move(game, assert, { r: 7, c: 0 }, { r: 5, c: 0 }, false, 'w')

    // Diagonal move
    game.board[6][1] = null
    move(game, assert, { r: 7, c: 0 }, { r: 6, c: 1 }, false, 'w')

    // more than 1 tile
    game.board[6][0] = null
    move(game, assert, { r: 7, c: 0 }, { r: 2, c: 0 }, true, 'w')

    // Move horizontal
    move(game, assert, { r: 2, c: 0 }, { r: 2, c: 7 }, true, 'w')

    // Move horizontal reverse
    move(game, assert, { r: 2, c: 7 }, { r: 2, c: 0 }, true, 'w')

    // Move Vertical reverse
    move(game, assert, { r: 2, c: 0 }, { r: 7, c: 0 }, true, 'w')
  })

  test('test knight moves', ({ assert }) => {
    const game = new ChessGame()

    // Un-Blocked
    move(game, assert, { r: 7, c: 1 }, { r: 5, c: 0 }, true, 'w')

    // Reverse
    move(game, assert, { r: 5, c: 0 }, { r: 7, c: 1 }, true, 'w')

    // Not L
    // Linear
    move(game, assert, { r: 7, c: 1 }, { r: 5, c: 1 }, false, 'w')

    // diagonal
    move(game, assert, { r: 7, c: 1 }, { r: 3, c: 1 }, false, 'w')
  })

  test('test baron moves', ({ assert }) => {
    const game = new ChessGame()

    // Block
    move(game, assert, { r: 7, c: 2 }, { r: 2, c: 7 }, false, 'w')

    // Diagonal
    game.board[6][3] = null
    move(game, assert, { r: 7, c: 2 }, { r: 2, c: 7 }, true, 'w')

    // Horizontal move
    move(game, assert, { r: 2, c: 7 }, { r: 2, c: 6 }, false, 'w')

    // vertical move
    move(game, assert, { r: 2, c: 7 }, { r: 3, c: 7 }, false, 'w')

    // reverse
    move(game, assert, { r: 2, c: 7 }, { r: 4, c: 5 }, true, 'w')
  })

  test('test queen moves', ({ assert }) => {
    const game = new ChessGame()

    // Block
    move(game, assert, { r: 7, c: 3 }, { r: 3, c: 3 }, false, 'w')

    // vertical
    game.board[6][3] = null
    move(game, assert, { r: 7, c: 3 }, { r: 3, c: 3 }, true, 'w')

    // vertical (reverse)
    move(game, assert, { r: 3, c: 3 }, { r: 5, c: 3 }, true, 'w')

    // horizntal
    move(game, assert, { r: 5, c: 3 }, { r: 5, c: 7 }, true, 'w')

    // horizntal (reverse)
    move(game, assert, { r: 5, c: 7 }, { r: 5, c: 0 }, true, 'w')

    // abstract
    move(game, assert, { r: 5, c: 0 }, { r: 2, c: 7 }, false, 'w')
  })

  test('test king moves', ({ assert }) => {
    const game = new ChessGame()

    // Ally tile
    move(game, assert, { r: 7, c: 4 }, { r: 6, c: 4 }, false, 'w')

    // 1 step vertical
    game.board[6][4] = null
    move(game, assert, { r: 7, c: 4 }, { r: 6, c: 4 }, true, 'w')

    // 1 step vertical (reverse)
    move(game, assert, { r: 6, c: 4 }, { r: 7, c: 4 }, true, 'w')

    // 1 step horizontal
    game.board[7][5] = null
    move(game, assert, { r: 7, c: 4 }, { r: 7, c: 5 }, true, 'w')

    // 1 step horizontal (reverse)
    move(game, assert, { r: 7, c: 5 }, { r: 7, c: 4 }, true, 'w')

    // // 2 step (no castling)
    game.board[7][4] = null
    game.board[5][4] = { type: 'K', color: 'w' }

    // 2 step vertical
    move(game, assert, { r: 5, c: 4 }, { r: 3, c: 4 }, false, 'w')

    // 2 step vertical (reverse)
    move(game, assert, { r: 5, c: 4 }, { r: 7, c: 4 }, false, 'w')

    // 2 step horizontal
    move(game, assert, { r: 5, c: 4 }, { r: 5, c: 7 }, false, 'w')

    // 2 step horizontal (reverse)
    move(game, assert, { r: 5, c: 4 }, { r: 5, c: 0 }, false, 'w')

    // Castling
    game.board[7][4] = { type: 'K', color: 'w' }
    game.board[5][4] = null
    game.board[7][6] = null

    // Castling king already move
    move(game, assert, { r: 7, c: 4 }, { r: 7, c: 6 }, false, 'w')

    // Reset game
    const game2 = new ChessGame()
    // casling block
    game2.board[7][6] = null
    move(game2, assert, { r: 7, c: 4 }, { r: 7, c: 6 }, false, 'w')

    // castling king side
    game2.board[7][5] = null
    move(game2, assert, { r: 7, c: 4 }, { r: 7, c: 6 }, true, 'w')

    assert.deepEqual(game2.board[7][6], { type: 'K', color: 'w' }) // King
    assert.deepEqual(game2.board[7][5], { type: 'R', color: 'w' }) // Rook

    // Reset game
    const game3 = new ChessGame()
    // castling queen side
    game3.board[7][3] = null
    game3.board[7][2] = null
    game3.board[7][1] = null
    move(game3, assert, { r: 7, c: 4 }, { r: 7, c: 2 }, true, 'w')

    assert.deepEqual(game3.board[7][2], { type: 'K', color: 'w' }) // King
    assert.deepEqual(game3.board[7][3], { type: 'R', color: 'w' }) // Rook
  })

  test('pawn promotion', ({ assert }) => {
    const game = new ChessGame()
    // Dummy
    game.board[0][0] = null
    game.board[1][0] = { type: 'P', color: 'w' }
    const to = { r: 0, c: 0 }
    const move = game.makeMove({ r: 1, c: 0 }, to)

    assert.isTrue(move.promote)
    game.promotion(to, 'Q')

    assert.deepEqual(game.board[0][0], { type: 'Q', color: 'w' })
  })

  // test('check detection', ({ assert }) => {
  //   const game = new ChessGame()

  //   // white
  //   game.board[0][4] = { type: 'K', color: 'w' }
  //   game.board[1][4] = { type: 'R', color: 'b' }
  //   console.log(game.turn)
  //   console.log('\n' + game.displayBoard())
  //   const check = game.makeMove({ r: 6, c: 0 }, { r: 5, c: 0 })
  //   // console.log(check)
  // })

  // test('checkmate detection', ({ assert }) => {
  //   const game = new ChessGame()
  //   // Setup Fool's mate
  //   game.board[0][4] = { type: 'K', color: 'b' }
  //   game.board[1][5] = { type: 'Q', color: 'w' }
  //   game.board[1][6] = { type: 'B', color: 'w' }

  //   const checkmate = game.isCheckmate('b')
  //   assert.isTrue(checkmate)
  // })
})
