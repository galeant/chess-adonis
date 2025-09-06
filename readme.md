# AdonisJS Project
This is an [AdonisJS](https://adonisjs.com/) project.

## Requirements
Before running the project, make sure you have installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/galeant/chess-adonis.git
cd chess-adonis
```
### 2. Install dependency
```bash
npm install
# or
yarn install
```
### 3. Setup environtment
```bash
cp .env.example .env
```
### 4. Generate key (optional)
```bash
node ace generate:key
```
### 5. Run chess on terminal
```bash
node ace chess:play
```


## Console Chess Game

A simple console-based chess game.

## Game Rules

1. **Piece Colors**
   - Pieces in **uppercase letters (A–Z)** = **White**
   - Pieces in **lowercase letters (a–z)** = **Black**

2. **Board Coordinates**
   - The chessboard is **8x8**.
   - **Columns** are labeled **a–h**.
   - **Rows** are labeled **1–8**.
   - Coordinates are displayed on the **outer edges** of the board for easy reference.

   Example board layout:
    ```
      a b c d e f g h
    8 r n b q k b n r
    7 p p p p p p p p
    6 . . . . . . . .
    5 . . . . . . . .
    4 . . . . . . . .
    3 . . . . . . . .
    2 P P P P P P P P
    1 R N B Q K B N R
    ```

- `P` = white pawn, `p` = black pawn
- `R` = white rook, `r` = black rook
- `N` = white knight, `n` = black knight
- `B` = white bishop, `b` = black bishop
- `Q` = white queen, `q` = black queen
- `K` = white king, `k` = black king

3. **Turns**

- The game **always starts with White**.
- White pieces are at the **bottom** (rows 1 and 2).
- Black pieces are at the **top** (rows 7 and 8).

4. **Input Format**

- Input is in the form of **starting coordinate** and **target coordinate**, separated by a comma.
- Example:
  ```
  a2,a3
  ```
  This means: the piece at **a2** moves to **a3**.

5. **Piece Movement**

- Each piece follows the **standard chess rules**:
  - **Pawn (P/p)**: moves forward one step, or two steps on its first move. Captures diagonally.
  - **Rook (R/r)**: moves vertically or horizontally.
  - **Knight (N/n)**: moves in an **L-shape** (two steps straight + one step to the side).
  - **Bishop (B/b)**: moves diagonally.
  - **Queen (Q/q)**: combines rook and bishop moves.
  - **King (K/k)**: moves one step in any direction.

## Winning Condition
- The game ends when **one king is captured**.
- **Check/checkmate** is not implemented in this basic version (optional for future development).
