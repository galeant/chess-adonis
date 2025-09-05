// app/services/chess_game.ts
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
    const cleaned = input.replace(/\s+/g, '')

    if (!/^[a-h][1-8][a-h][1-8]$/.test(cleaned)) {
      return null
    }

    const from = this.parseCoordinate(cleaned.slice(0, 2))!
    const to = this.parseCoordinate(cleaned.slice(2, 4))!

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
    const adr = Math.abs(diffRow)
    const adc = Math.abs(diffCol)

    switch (pieceFrom.type) {
      case 'P': {
        const dir = pieceFrom.color === 'w' ? -1 : 1
        const startRow = pieceFrom.color === 'w' ? 6 : 1

        if (dc === 0 && dr === dir && !dest) return { ok: true }
        if (dc === 0 && dr === 2 * dir && from.r === startRow && !dest) return { ok: true }
        if (adc === 1 && dr === dir && dest && dest.color !== piece.color) return { ok: true }
        return { ok: false }
      }
      case 'R': {
        if (dr !== 0 && dc !== 0) return { ok: false }
        if (!this.isPathClear(from, to)) return { ok: false }
        return { ok: true }
      }
      case 'B': {
        if (adr !== adc) return { ok: false }
        if (!this.isPathClear(from, to)) return { ok: false }
        return { ok: true }
      }
      case 'Q': {
        if (!(dr === 0 || dc === 0 || adr === adc)) return { ok: false }
        if (!this.isPathClear(from, to)) return { ok: false }
        return { ok: true }
      }
      case 'N': {
        if ((adr === 2 && adc === 1) || (adr === 1 && adc === 2)) return { ok: true }
        return { ok: false }
      }
      case 'K': {
        if (Math.max(adr, adc) === 1) return { ok: true }
        return { ok: false }
      }
    }
  }

  getPiece(pos: { r: number; c: number }) {
    return this.board[pos.r][pos.c]
  }

  setPiece(pos: { r: number; c: number }, piece: Piece) {
    this.board[pos.r][pos.c] = piece
  }

  inBounds(pos: { r: number; c: number }) {
    return pos.r >= 0 && pos.r < 8 && pos.c >= 0 && pos.c < 8
  }

  isPathClear(from: { r: number; c: number }, to: { r: number; c: number }) {
    const dr = Math.sign(to.r - from.r)
    const dc = Math.sign(to.c - from.c)
    let r = from.r + dr
    let c = from.c + dc
    while (r !== to.r || c !== to.c) {
      if (this.board[r][c] !== null) return false
      r += dr
      c += dc
    }
    return true
  }
}
