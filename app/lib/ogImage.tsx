import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import { getProject, getPublishedProjects } from "../data/projects";

export const OG_SIZE = { width: 1200, height: 630 };

let cachedFontData: ArrayBuffer | null = null;
function loadPixelFont(): ArrayBuffer {
  if (!cachedFontData) {
    const fontPath = path.join(process.cwd(), "public", "fonts", "pixelify-sans.ttf");
    const buf = fs.readFileSync(fontPath);
    // Buffer.buffer can point into Node's shared buffer pool instead of
    // just this file's bytes, so slice out only this buffer's range or
    // satori ends up parsing a misaligned/garbage font.
    cachedFontData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
  return cachedFontData;
}

// Pixelify Sans draws small for its size; on the site it's scaled up 134%
// (app/layout.tsx), so the sizes below carry the same factor.
export function getOgFonts() {
  return [{ name: "Pixelify Sans", data: loadPixelFont(), style: "normal" as const, weight: 400 as const }];
}

const SKILLS = ["C# / .NET", "REACT", "SQL", "APP SECURITY"];

/** Shared social preview layout for Open Graph and Twitter images. */
export function TrainerCardOgImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #0a2e45 0%, #146b6a 55%, #1c8a72 100%)",
        fontFamily: "Pixelify Sans",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 980,
          background: "#F8EFD8",
          border: "6px solid #2A2A1E",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "12px 12px 0 rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 40px",
            background: "#146b6a",
            borderBottom: "6px solid #2A2A1E",
          }}
        >
          <div style={{ display: "flex", color: "#F8EFD8", fontSize: 38, letterSpacing: 2 }}>HANSVIDAURE.DEV</div>
          <div style={{ display: "flex", color: "rgba(248,239,216,0.8)", fontSize: 24 }}>OPEN TO FULL-STACK ROLES · NYC / REMOTE</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", padding: "44px 48px 48px", gap: 26 }}>
          <div style={{ display: "flex", color: "#2A2A1E", fontSize: 75, letterSpacing: 1 }}>HANS VIDAURE</div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              background: "#ffffff",
              border: "3px solid #2A2A1E",
              boxShadow: "4px 4px 0 rgba(0,0,0,0.3)",
              padding: "14px 20px",
              width: 620,
            }}
          >
            <div style={{ display: "flex", color: "#6b6a5a", fontSize: 21, letterSpacing: 1 }}>FISERV · ONLINE BANKING</div>
            <div style={{ display: "flex", color: "#146b6a", fontSize: 32 }}>FULL-STACK SOFTWARE ENGINEER</div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {SKILLS.map((skill) => (
              <div
                key={skill}
                style={{
                  display: "flex",
                  color: "#2A2A1E",
                  fontSize: 24,
                  padding: "10px 20px",
                  background: "#F8EFD8",
                  border: "3px solid #2A2A1E",
                  borderRadius: 999,
                  boxShadow: "3px 3px 0 rgba(0,0,0,0.25)",
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const INK = "#2A2A1E";
const CREAM = "#F8EFD8";
const TEAL = "#146b6a";

/** A picture from public/ as a data URI: satori can't read files itself. */
function publicImage(src: string): string {
  const type = src.endsWith(".png") ? "image/png" : "image/jpeg";
  return `data:${type};base64,${fs.readFileSync(path.join(process.cwd(), "public", src)).toString("base64")}`;
}

/** Scale a picture to fit inside a box, keeping its shape. */
function fit(width: number, height: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / width, maxHeight / height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * A case study's link preview: the site card's frame around the project's
 * name, what it is, and its cover, so a shared link shows the project rather
 * than the home page's card.
 */
function ProjectOgCard({ slug }: { slug: string }) {
  const project = getProject(slug);
  if (!project) return <TrainerCardOgImage />;
  const cover = project.cover;
  const shown = cover && fit(cover.width, cover.height, 500, 340);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #0a2e45 0%, #146b6a 55%, #1c8a72 100%)",
        fontFamily: "Pixelify Sans",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1100,
          height: 540,
          background: CREAM,
          border: `6px solid ${INK}`,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "12px 12px 0 rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 40px",
            background: TEAL,
            borderBottom: `6px solid ${INK}`,
          }}
        >
          <div style={{ display: "flex", color: CREAM, fontSize: 34, letterSpacing: 2 }}>HANSVIDAURE.DEV</div>
          <div style={{ display: "flex", color: "rgba(248,239,216,0.8)", fontSize: 24 }}>
            {`CASE STUDY · ${project.kind.toUpperCase()}`}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "0 40px", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 22 }}>
            <div style={{ display: "flex", color: INK, fontSize: 64, lineHeight: 1.05 }}>{project.title}</div>
            <div style={{ display: "flex", color: "#4a4a3a", fontSize: 27, lineHeight: 1.35 }}>{project.tagline}</div>
          </div>
          {cover && shown && (
            <div
              style={{
                display: "flex",
                flexShrink: 0,
                border: `4px solid ${INK}`,
                boxShadow: "6px 6px 0 rgba(0,0,0,0.3)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- satori draws plain <img>, not next/image */}
              <img src={publicImage(cover.src)} width={shown.width} height={shown.height} alt="" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** For app/projects/[slug]/opengraph-image.tsx and twitter-image.tsx: drawn once per project at build. */
export const projectOgImageParams = () => getPublishedProjects().map((p) => ({ slug: p.slug }));
export const PROJECT_OG_ALT = "The case study's link preview: the project's name, what it is, and a screenshot";
export function projectOgImage({ params }: { params: { slug: string } }) {
  return new ImageResponse(<ProjectOgCard slug={params.slug} />, { ...OG_SIZE, fonts: getOgFonts() });
}
