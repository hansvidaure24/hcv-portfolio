import { ReactNode } from "react";
import styles from "./ProjectDescription.module.scss";

// Matches **bold** and [label](https://link) inside a line.
const INLINE_PATTERN = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    if (match[1]) {
      parts.push(<strong key={index}>{match[1]}</strong>);
    } else {
      parts.push(
        <a key={index} href={match[3]} target="_blank" rel="noopener noreferrer">
          {match[2]}
        </a>
      );
    }
    last = index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

type Block =
  | { kind: "heading"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "paragraph"; lines: string[] };

/**
 * Renders a project's .txt description. Plain text shows as before; a few
 * Markdown bits are supported for longer write-ups: "## " headings, "- " lists,
 * **bold** and [label](url) links. Blank lines separate paragraphs.
 */
export default function ProjectDescription({ text }: { text: string }) {
  const blocks: Block[] = [];
  let current: Block | null = null;

  for (const rawLine of text.replace(/\r\n/g, "\n").trim().split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      current = null;
    } else if (line.startsWith("## ")) {
      blocks.push({ kind: "heading", text: line.slice(3) });
      current = null;
    } else if (line.startsWith("- ")) {
      if (current?.kind !== "list") {
        current = { kind: "list", items: [] };
        blocks.push(current);
      }
      current.items.push(line.slice(2));
    } else {
      if (current?.kind !== "paragraph") {
        current = { kind: "paragraph", lines: [] };
        blocks.push(current);
      }
      current.lines.push(line);
    }
  }

  return (
    <div className={styles.description}>
      {blocks.map((block, i) => {
        if (block.kind === "heading") return <h2 key={i}>{block.text}</h2>;
        if (block.kind === "list") {
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{renderInline(block.lines.join("\n"))}</p>;
      })}
    </div>
  );
}
