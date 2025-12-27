# Velurin — VTT (Virtual Tabletop)

**Quick summary** 
A lightweight VTT built with Node.js + Express and Socket.io. The server serves static web assets (canvas-based board UI) and handles real-time chat and board synchronization across connected clients.

---

## Quick start ⚡
1. Install dependencies:

   ```bash
   npm install
   ```
2. Start dev server (uses nodemon):

   ```bash
   npm start
   ```
3. Open the board in a browser:
   - http://localhost:3000/ or `/main` (served from `Statics/VTT/main.html`)

> Note: By default the app uses port 3000. To change it, update `server.js` or set your env var (the current code uses `3000` by default).


## Real-time contract (socket events) 🔁
- Client -> Server
  - `csm` : chat message (raw text)
  - `board_update` : full `render_queue` payload representing board state
  - `request_board` : ask server for current board state (sent on connect)
- Server -> Client
  - `scm` : broadcasted chat messages (stringified JSON)
  - `server` : control messages (e.g., `toolong`, `roll` results)
  - `board_update` : broadcasted full board state

## Suggested next improvements 💡
- Add persistence (e.g., save board to a DB or disk snapshot).
- Implement diff-based updates or throttling for freehand/dragging updates.
- Add authentication/permissions for multi-user control of elements.

---

