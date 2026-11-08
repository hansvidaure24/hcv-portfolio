Pocket Quest is a co-op tactics RPG for 2–4 players that runs in the browser. One screen hosts the game: a TV, a projector or a Discord screenshare. Everyone else scans a QR code and their phone becomes the controller. No installs, no accounts, no game server to rent.

## Problem
Jackbox showed that a phone is enough of a controller for a room full of people. I wanted the same for a tactics RPG: something friends can start on a call in under a minute, without anyone downloading anything, and that stays readable on a shared screen.

## By the numbers
- 2–4 players, 10–15 minute sessions, plus a solo practice mode with bot teammates
- Campaign and endless Survival modes
- 4 classes with 2 loadouts each, 11 enemy types and 5 bosses, all with telegraphed attacks players can learn
- About 10,000 lines of JavaScript across 27 modules, with no runtime dependencies and no build step
- Unit tests run the real game modules in Node. A self-play test has bots play a full campaign and 3 Survival waves in a headless browser, on every push.

## Key decisions
**The host is the only source of truth.** All game logic runs on the host screen. Phones send inputs and show your health, cooldowns and nearby threats, so they stay fast on any device and there's nothing to fall out of sync.

**Everyone moves at once.** Every 1–1.5 seconds, all inputs resolve together. It feels live, but stays readable and tactical on a shared screen.

**Facing is targeting.** Attacks go where you last moved, so a small phone screen doesn't need a target button.

**Dead players keep playing.** Ghosts can't attack, but they buff nearby allies and block enemies, so nobody sits out the rest of the session.

## What was hard
**Connecting phones without a server.** The game tries three transports in order: same-browser messaging for local testing, a WebSocket relay on a Cloudflare Worker (free tier), then peer-to-peer WebRTC. If a phone drops, it reconnects and keeps its slot. I wrote the reconnection and rate limiting myself.

**Hex movement on a phone.** Six directions don't fit a normal d-pad. I settled on swipe input and tuned the dead zones until diagonal moves felt right.

**Knowing what I gave up.** No server means no saves and no matchmaking, and the game ends if the host leaves. For a 15-minute session with friends, that trade is worth it.

## Built with
JavaScript (ES modules), HTML5 Canvas, Web Audio API, PeerJS (WebRTC), Cloudflare Workers and Durable Objects, Node's test runner, Playwright, GitHub Actions and GitHub Pages.
