export type Color = 'w' | 'b'
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P'
export type Piece = { type: PieceType; color: Color } | null

export default class ChessGame {
  board: Piece[][]
  turn: Color
  // Default position king
  kingPos: Record<Color, { r: number; c: number }> = { w: { r: 7, c: 4 }, b: { r: 0, c: 4 } }
  // Track king and rook is move
  kingMoved: Record<Color, boolean> = { w: false, b: false }
  rookMoved: Record<Color, { left: boolean; right: boolean }> = {
    w: { left: false, right: false },
    b: { left: false, right: false },
  }

  constructor() {
    this.board = this.initBoard()
    this.turn = 'w'
  }

  initBoard(): Piece[][] {
    const board: Piece[][] = []
    for (let rows = 0; rows < 8; rows++) {
      let columns: Piece[] = []
      for (let col = 0; col < 8; col++) {
        columns[col] = null
      }
      board[rows] = columns
    }

    // const emptyRow: Piece[] = Array(8).fill(null)
    // const boardd: Piece[][] = Array.from({ length: 8 }, () => [...emptyRow])

    const backRank: PieceType[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']

    board[0] = backRank.map((t) => ({ type: t, color: 'b' }))

    board[1] = Array(8).fill({ type: 'P', color: 'b' })
    board[6] = Array(8).fill({ type: 'P', color: 'w' })
    board[7] = backRank.map((t) => ({ type: t, color: 'w' }))

    return board
  }

  displayBoard(): string {
    const pieceChar = (p: Piece) => {
      if (!p) return '.'
      const map: Record<PieceType, string> = {
        K: 'K',
        Q: 'Q',
        R: 'R',
        B: 'B',
        N: 'N',
        P: 'P',
      }
      const cheesChar = map[p.type]
      return p.color === 'w' ? cheesChar : cheesChar.toLowerCase()
    }

    let out = '  a b c d e f g h\n'
    for (let r = 0; r < 8; r++) {
      out += 8 - r + ' '
      for (let c = 0; c < 8; c++) {
        out += pieceChar(this.board[r][c]) + ' '
      }
      out += '\n'
    }
    return out
  }

  checkForWin() {
    let wKing = false
    let bKing = false
    for (const row of this.board) {
      for (const p of row) {
        if (p?.type === 'K') {
          if (p.color === 'w') {
            wKing = true
          } else {
            bKing = true
          }
        }
      }
    }

    if (!wKing) {
      return { finished: true, winner: 'Black' }
    }

    if (!bKing) {
      return { finished: true, winner: 'White' }
    }

    return { finished: false }
  }

  validateCommand(input: string) {
    let cleaned = input.replace(/\s+/g, '').split(',')

    if (cleaned.length !== 2) {
      return null
    }

    const [fromStr, toStr] = cleaned

    const coordRegex = /^[a-h][1-8]$/
    if (!coordRegex.test(fromStr) || !coordRegex.test(toStr)) {
      return null
    }

    const from = this.parseCoordinate(cleaned[0])!
    const to = this.parseCoordinate(cleaned[1])!

    return { from, to }
  }

  parseCoordinate(s: string) {
    if (!/^[a-h][1-8]$/.test(s)) {
      return null
    }
    const coorCol = s.charCodeAt(0) - 'a'.charCodeAt(0)
    const parseRow = parseInt(s[1], 10)
    const coorRow = 8 - parseRow
    return { r: coorRow, c: coorCol }
  }

  makeMove(from: { r: number; c: number }, to: { r: number; c: number }) {
    const validate = this.validateMove(from, to)
    if (!validate?.ok) {
      return { ok: false, msg: validate?.msg }
    }
    const moving = this.getPiece(from)
    this.setPiece(to, moving)
    this.setPiece(from, null)

    // validate is on check
    // const isCheck = this.isOnAttack(this.kingPos[this.turn])
    // if (isCheck) {
    //   this.setPiece(to, null)
    //   this.setPiece(from, moving)
    //   return { ok: false, msg: 'you are on check' }
    // }

    // Pawn promote
    const lastRow = moving?.color === 'w' ? 0 : 7
    if (moving && moving.type === 'P' && to.r === lastRow) {
      return { ok: true, msg: 'moved', promote: true }
    }

    if (moving?.type === 'K') {
      // Track King move
      this.kingPos[moving.color] = { ...to }
      this.kingMoved[moving.color] = true
      // Castling
      if (Math.abs(to.c - from.c) === 2) {
        const kingside = to.c > from.c
        const rookFromC = kingside ? 7 : 0
        const rookToC = kingside ? 5 : 3

        const rook = this.getPiece({ r: from.r, c: rookFromC })
        if (rook && rook.type === 'R') {
          this.setPiece({ r: from.r, c: rookToC }, rook)
          this.setPiece({ r: from.r, c: rookFromC }, null)
        }
      }
    }

    // Rook track move for castling
    if (moving?.type === 'R') {
      if (from.r === 7) {
        // White rook
        if (from.c === 0) {
          this.rookMoved['w'].left = true
        } else if (from.c === 7) {
          this.rookMoved['w'].right = true
        }
      }
      // Black rook
      if (from.r === 0) {
        if (from.c === 0) {
          this.rookMoved['b'].left = true
        } else if (from.c === 7) {
          this.rookMoved['b'].right = true
        }
      }
    }

    this.turn = this.turn === 'w' ? 'b' : 'w'
    return { ok: true, msg: 'moved' }
  }

  validateMove(
    from: { r: number; c: number },
    to: { r: number; c: number },
    checkAttack?: boolean
  ) {
    const pieceFrom = this.getPiece(from)
    if (!pieceFrom) {
      return { ok: false, msg: 'no piece' }
    }

    const pieceTo = this.getPiece(to)
    if (pieceTo && pieceTo.color === pieceFrom.color) {
      return { ok: false, msg: 'same color' }
    }

    if (!checkAttack) {
      if (pieceFrom.color !== this.turn) {
        return { ok: false, msg: 'wrong turn' }
      }
    }

    const diffRow = to.r - from.r
    const diffCol = to.c - from.c

    const absRow = Math.abs(diffRow)
    const absCol = Math.abs(diffCol)

    switch (pieceFrom.type) {
      // Pawn
      case 'P': {
        return this.validatePawnMove(pieceFrom, pieceTo, from, to, diffRow, diffCol, absCol)
      }
      // Rook
      case 'R': {
        return this.validateLinearMove(from, to, diffRow, diffCol)
      }
      // Baron
      case 'B': {
        return this.validateDiagonalMove(from, to, absRow, absCol)
      }
      // Queen
      case 'Q': {
        return this.validateQueenMove(from, to, diffRow, diffCol, absRow, absCol)
      }
      // Knight
      case 'N': {
        return this.validateKnightMove(absRow, absCol)
      }
      // King
      case 'K': {
        return this.validateKingMove(from, to, absRow, absCol)
      }
    }
  }

  getPiece(pos: { r: number; c: number }) {
    return this.board[pos.r][pos.c]
  }

  setPiece(pos: { r: number; c: number }, piece: Piece) {
    this.board[pos.r][pos.c] = piece
  }

  isPathClear(from: { r: number; c: number }, to: { r: number; c: number }) {
    const diffR = Math.sign(to.r - from.r)
    const diffC = Math.sign(to.c - from.c)
    let r = from.r + diffR
    let c = from.c + diffC
    while (r !== to.r || c !== to.c) {
      if (this.board[r][c] !== null) {
        return { ok: false, msg: 'Path blocked' }
      }
      r += diffR
      c += diffC
    }
    return { ok: true }
  }

  validatePawnMove(
    pieceFrom: Piece,
    pieceTo: Piece,
    from: { r: number; c: number },
    to: { r: number; c: number },
    diffRow: number,
    diffCol: number,
    absCol: number
  ) {
    const dir = pieceFrom?.color === 'w' ? -1 : 1
    const startRow = pieceFrom?.color === 'w' ? 6 : 1

    const { ok, msg } = this.isPathClear(from, to)

    if (!ok) {
      return { ok: false, msg: msg }
    }
    // 1 step
    if (diffCol === 0 && diffRow === dir && !pieceTo && ok) {
      return { ok: true }
    }

    // 2 step first
    if (diffCol === 0 && diffRow === 2 * dir && from.r === startRow && !pieceTo && ok) {
      return { ok: true }
    }

    // take enemey
    if (absCol === 1 && diffRow === dir && pieceTo && pieceTo.color !== pieceFrom?.color) {
      return { ok: true }
    }
    // else
    return { ok: false, msg: 'Invalid pawn move' }
  }

  validateLinearMove(
    from: { r: number; c: number },
    to: { r: number; c: number },
    diffRow: number,
    diffCol: number
  ) {
    if (diffRow !== 0 && diffCol !== 0) {
      return { ok: false, msg: 'Invalid linear move' }
    }
    return this.isPathClear(from, to)
  }

  validateDiagonalMove(
    from: { r: number; c: number },
    to: { r: number; c: number },
    absRow: number,
    absCol: number
  ) {
    if (absRow !== absCol) {
      return { ok: false, msg: 'Invalid diagonal move' }
    }

    return this.isPathClear(from, to)
  }

  validateQueenMove(
    from: { r: number; c: number },
    to: { r: number; c: number },
    diffRow: number,
    diffCol: number,
    absRow: number,
    absCol: number
  ) {
    if (diffRow === 0 || diffCol === 0) {
      return this.validateLinearMove(from, to, diffRow, diffCol)
    }

    if (absRow === absCol) {
      return this.validateDiagonalMove(from, to, absRow, absCol)
    }

    return { ok: false, msg: 'Invalid queen move' }
  }

  validateKnightMove(absRow: number, absCol: number) {
    // L dir
    if ((absRow === 2 && absCol === 1) || (absRow === 1 && absCol === 2)) {
      return { ok: true }
    }
    return { ok: false, msg: 'Invalid knight move' }
  }

  validateKingMove(
    from: { r: number; c: number },
    to: { r: number; c: number },
    absRow: number,
    absCol: number
  ) {
    if (absRow === 0 && absCol === 2) {
      if (this.kingMoved[this.turn]) {
        return { ok: false, msg: 'King already moved' }
      }

      const kingside = to.c > from.c

      const rookC = kingside ? 7 : 0 // 7 right rook, 0 left rook
      const rook = this.getPiece({ r: from.r, c: rookC })
      if (!rook || rook.type !== 'R') {
        return { ok: false, msg: 'No rook to castle' }
      }

      const checkPath = this.isPathClear(from, to)
      if (!checkPath?.ok) {
        return { ok: false, msg: 'Path blocked' }
      }
      // const step = kingside ? 1 : -1
      // for (let c = from.c + step; c !== rookC; c += step) {
      //   if (this.getPiece({ r: from.r, c })) return { ok: false, reason: 'Path blocked' }
      // }

      // const step = kingside ? 1 : -1
      // for (let c = from.c; c !== to.c + step; c += step) {
      //   if (this.isOnAttack({ r: from.r, c }))
      //     return { ok: false, reason: 'King would pass through check' }
      // }

      return { ok: true }
    }

    if (Math.max(absRow, absCol) === 1) {
      return { ok: true }
    }
    return { ok: false, msg: 'Invalid king move' }
  }

  promotion(to: { r: number; c: number }, promoteTo: PieceType) {
    const piece = this.getPiece(to)
    if (piece && piece.type === 'P') {
      this.setPiece(to, { type: promoteTo, color: piece.color })
    }
  }

  isOnAttack(pos: { r: number; c: number }): boolean {
    const enemy: Color = this.turn === 'w' ? 'b' : 'w'

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c]
        if (piece && piece.color === enemy) {
          const enemyMove = this.validateMove({ r, c }, pos, true)
          // console.log(enemyMove, enemy, { r, c })
          if (enemyMove.ok) {
            return true
          }
        }
      }
    }
    return false
  }
}
