# Velurin — VTT (Virtual Tabletop)

**Quick summary** 
A lightweight VTT built with Node.js + Express and Socket.io. The server serves static web assets (canvas-based board UI) and handles real-time chat and board synchronization across connected clients. Currently deployed on a free render [site](https://velurian-vtt-proj.onrender.com/). The deployed site doesn't support some features becuase of the free server grade like image uploading, though these can be tested from a localhost.

---

## Quick start Guide
1. Install dependencies:

   ```bash
   npm install
   ```
2. Start dev server (uses nodemon):

   ```bash
   npm start
   ```
3. Open the board in a browser:
   - http://localhost:3000/ 


## Features
- Custom canvas object manipulation and selection.
- Chat and dice commands with command parser.
- Image uploading
- Layer controls and management.


## Next Steps
- Add persistence (e.g., save board to a DB or disk snapshot). To do this I will need to make a login system and manage multiple Socket rooms. 
- Implement diff-based updates or throttling for freehand/dragging updates.
- Add authentication/permissions for multi-user control of elements.

---

