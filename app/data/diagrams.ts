/**
 * How each project fits together, drawn on its case study (SystemDiagram).
 * Every box and arrow is checked against the project's own code, not just
 * its write-up, and says what that part does rather than repeating the
 * case study's numbers.
 */

export type DiagramNode = { title: string; detail: string };

/**
 * The arrows between a box and the next one. `forward` (left to right, or
 * down) is always drawn; `back` is drawn when set. Either label can be empty
 * for a bare arrow.
 */
export type DiagramLink = { forward: string; back?: string };

export type Diagram = {
  title: string;
  nodes: DiagramNode[];
  /** links[i] joins nodes[i] and nodes[i + 1]. */
  links: DiagramLink[];
  /** An arrow from the last box back to the first. */
  loop?: string;
};

export const DIAGRAMS: Record<string, Diagram> = {
  // src/items.ts, src/scan/{quality,process,engine-paddle,paddle.worker,parse}.ts, src/money.ts, src/db.ts
  sliceofpie: {
    title: "From a photo to a split bill",
    nodes: [
      {
        title: "Scanner",
        detail: "Checks the photo for blur and lighting, then runs PaddleOCR on ONNX Runtime in a Web Worker",
      },
      { title: "Parser", detail: "Turns lines of text into items, prices, discounts and tax" },
      { title: "The bill", detail: "You assign the items. Shares are whole cents, saved on the phone in IndexedDB" },
    ],
    links: [{ forward: "lines of text" }, { forward: "items" }],
  },
  // editor/, src-tauri/, adapters/unity/{BehaviorTreeRunner,TickRecorder}.cs, editor/replay.js
  "behavior-tree-editor": {
    title: "From the editor to a running enemy, and back",
    nodes: [
      { title: "Editor", detail: "Canvas 2D and plain JavaScript, as a web page or a desktop app" },
      { title: "Unity project", detail: "The tree's logic in a .bt.json file, node positions in a layout file" },
      { title: "Game runtime", detail: "C# in Unity. Each leaf calls game code by name" },
    ],
    links: [{ forward: "saved by Tauri" }, { forward: "hot reload" }],
    loop: "Back to the editor: every tick is recorded to a .replay.json, which the replay debugger scrubs through",
  },
  // js/net.js, relay/, NETWORKING.md
  "pocket-quest": {
    title: "One host, every phone a controller",
    nodes: [
      { title: "Phones", detail: "Swipe to move; see your own health, cooldowns and nearby threats" },
      { title: "Connection", detail: "Same-browser, a Cloudflare relay or WebRTC: each phone keeps the first that works" },
      { title: "Host screen", detail: "All the game logic. Resolves everyone's inputs together every 1 to 1.5 seconds" },
    ],
    links: [{ forward: "inputs", back: "your state only" }, { forward: "", back: "" }],
  },
  // Assets/Scripts/Character/{CharacterNetworkManager,AI Character/*}.cs
  wakebound: {
    title: "Who decides what in co-op",
    nodes: [
      { title: "Your game", detail: "You own your character: its health, stamina and position" },
      { title: "Host", detail: "Runs every enemy, each built from reusable AI states; a perception layer picks when to switch" },
      { title: "A friend's game", detail: "Owns their character the same way" },
    ],
    links: [{ forward: "your character", back: "enemies, hits, animations" }, { forward: "", back: "" }],
  },
};
