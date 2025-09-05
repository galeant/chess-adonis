export type Color = 'w' | 'b'
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P'
export type Piece = { type: PieceType; color: Color } | null

export default class ChessGame {
  board: Piece[][]
  turn: Color

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
    if (!wKing) return { finished: true, winner: 'b' }
    if (!bKing) return { finished: true, winner: 'w' }
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
    const v = this.validateMove(from, to)
    if (!v?.ok) return { ok: false, msg: 'illegal move' }
    const moving = this.getPiece(from)
    this.setPiece(to, moving)
    this.setPiece(from, null)
    this.turn = this.turn === 'w' ? 'b' : 'w'
    return { ok: true, msg: 'moved' }
  }

  validateMove(from: { r: number; c: number }, to: { r: number; c: number }) {
    const pieceFrom = this.getPiece(from)
    if (!pieceFrom) {
      return { ok: false, reason: 'no piece' }
    }

    if (pieceFrom.color !== this.turn) {
      return { ok: false, reason: 'wrong turn' }
    }

    const pieceTo = this.getPiece(to)
    if (pieceTo && pieceTo.color === pieceFrom.color) {
      return { ok: false, reason: 'same color' }
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
        return this.validateKingMove(absRow, absCol)
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
        return { ok: false, reason: 'Path blocked' }
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

    const { ok } = this.isPathClear(from, to)
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
    return { ok: false, reason: 'Invalid pawn move' }
  }

  validateLinearMove(
    from: { r: number; c: number },
    to: { r: number; c: number },
    diffRow: number,
    diffCol: number
  ) {
    if (diffRow !== 0 && diffCol !== 0) {
      return { ok: false, reason: 'Invalid linear move' }
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
      return { ok: false, reason: 'Invalid diagonal move' }
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

    return { ok: false, reason: 'Invalid queen move' }
  }

  validateKnightMove(absRow: number, absCol: number) {
    // L dir
    if ((absRow === 2 && absCol === 1) || (absRow === 1 && absCol === 2)) {
      return { ok: true }
    }
    return { ok: false, reason: 'Invalid knight move' }
  }

  validateKingMove(absRow: number, absCol: number) {
    if (Math.max(absRow, absCol) === 1) {
      return { ok: true }
    }
    return { ok: false, reason: 'Invalid king move' }
  }
}
