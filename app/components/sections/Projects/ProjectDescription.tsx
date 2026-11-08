import { ReactNode } from "react";
import Link from "next/link";
import styles from "./ProjectDescription.module.scss";

// Matches **bold**, `code`, and [label](https://link or /on-site-path) inside a line.
const INLINE_PATTERN = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]*)\)/g;

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    if (match[1]) {
      // Bold text can hold `code` or a link of its own.
      parts.push(<strong key={index}>{renderInline(match[1])}</strong>);
    } else if (match[2]) {
      parts.push(<code key={index}>{match[2]}</code>);
    } else if (match[4]!.startsWith("/")) {
      parts.push(
        <Link key={index} href={match[4]!}>
          {match[3]}
        </Link>
      );
    } else {
      parts.push(
        <a key={index} href={match[4]} target="_blank" rel="noopener noreferrer">
          {match[3]}
        </a>
      );
    }
    last = index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

type Block =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "paragraph"; lines: string[] }
  | { kind: "code"; lang: string; lines: string[] };

/**
 * Renders a case study or field note written in a small Markdown subset:
 * "## " and "### " headings, "- " lists, ``` fenced code blocks, **bold**,
 * `code` and [label](url) links (https:// or an on-site /path). Blank lines
 * separate paragraphs.
 */
export default function ProjectDescription({ text }: { text: string }) {
  const blocks: Block[] = [];
  let current: Block | null = null;

  for (const rawLine of text.replace(/\r\n/g, "\n").trim().split("\n")) {
    // Inside a fenced block, keep every line as written (indentation included).
    if (current?.kind === "code") {
      if (rawLine.trim().startsWith("```")) current = null;
      else current.lines.push(rawLine);
      continue;
    }

    const line = rawLine.trim();
    if (line.startsWith("```")) {
      current = { kind: "code", lang: line.slice(3).trim(), lines: [] };
      blocks.push(current);
    } else if (!line) {
      current = null;
    } else if (line.startsWith("### ")) {
      blocks.push({ kind: "heading", level: 3, text: line.slice(4) });
      current = null;
    } else if (line.startsWith("## ")) {
      blocks.push({ kind: "heading", level: 2, text: line.slice(3) });
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
        if (block.kind === "heading") {
          return block.level === 3 ? <h3 key={i}>{block.text}</h3> : <h2 key={i}>{block.text}</h2>;
        }
        if (block.kind === "code") {
          return (
            // Scrolls sideways on phones; focusable so keyboard users can scroll it too.
            <pre key={i} tabIndex={0} aria-label={block.lang ? `${block.lang} code` : "Code"}>
              <code>{block.lines.join("\n")}</code>
            </pre>
          );
        }
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
