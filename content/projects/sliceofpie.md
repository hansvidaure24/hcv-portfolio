SliceOfPie splits a bill by item or evenly. Scan the receipt with your phone: the text recognition runs in the browser and works offline. It installs like an app, with no accounts, no server and no tracking.

## Problem
Every bill-splitting app I tried wanted everyone to sign up, needed a connection, or wanted my data. I wanted one that works at the table with no signal, from a photo of the receipt, and never sends that photo anywhere.

## By the numbers
- Lighthouse on mobile: 99 performance, 100 accessibility, 100 best practices, 100 SEO
- 0 ms blocking time and no layout shift
- About 25 KB of gzipped JavaScript at startup: a 23 KB app bundle plus a 2 KB service-worker helper
- The 36 MB receipt scanner only downloads when you ask for it, then works offline
- axe finds no accessibility issues on any screen, in light or dark mode
- 198 unit tests and 47 end-to-end tests, each run on phone and desktop, on every push
- No framework: about 4,900 lines of TypeScript across 49 modules

## Key decisions
**No framework.** The app is small enough that a framework would add a virtual DOM and a state library to solve problems it doesn't have. Every screen re-renders through an explicit render function, so each state change is easy to trace, and startup stays at about 25 KB.

**PaddleOCR instead of Tesseract.** Tesseract.js got every price right on 4 of my 16 test receipts. PaddleOCR on ONNX Runtime, in a Web Worker, got 16 of 16. The cost was size, so the scanner asks before it downloads and is cached for offline use. Tesseract stays as a fallback for browsers that can't run it.

## What was hard
**Reading receipts on the phone.** After choosing PaddleOCR I had to make it fast enough on a phone and pair prices back up with items after straightening tilted photos.

**Money that always adds up.** Shares are worked out in whole cents and whoever paid takes the leftover cent, so $100 three ways is $33.33, $33.33 and $33.34. Everything rounds through one function, so 178.365 can't round two different ways.

**A bug only a real iPhone showed.** Installed on the Home Screen, the app opened with its tab bar floating above the bottom of the screen. It never happened in a browser or a test. I added a size readout to Settings and went through a screen recording frame by frame to find out why. The fix is shipped and I'm still confirming it on a device.

## Built with
Vite 8, TypeScript, Workbox service worker, PaddleOCR (PP-OCRv5) on ONNX Runtime Web, IndexedDB, Vitest, Playwright + axe-core, Lighthouse CI on GitHub Actions, strict Content-Security-Policy.
