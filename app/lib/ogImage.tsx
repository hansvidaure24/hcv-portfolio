import fs from "fs";
import path from "path";

export const OG_SIZE = { width: 1200, height: 630 };

let cachedFontData: ArrayBuffer | null = null;
function loadPokePixelFont(): ArrayBuffer {
  if (!cachedFontData) {
    const fontPath = path.join(process.cwd(), "public", "fonts", "pokepixel-gba.ttf");
    const buf = fs.readFileSync(fontPath);
    // Buffer.buffer can be a larger, offset view into Node's shared buffer
    // pool rather than the file's own bytes — slice out exactly this
    // buffer's range so satori doesn't get a misaligned/garbage font.
    cachedFontData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
  return cachedFontData;
}

export function getOgFonts() {
  return [{ name: "PokePixel", data: loadPokePixelFont(), style: "normal" as const, weight: 400 as const }];
}

const SKILLS = ["FULL-STACK DEV", "UI/UX", "WEB DESIGN", "APP SECURITY"];

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
        fontFamily: "PokePixel",
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
          <div style={{ display: "flex", color: "#F8EFD8", fontSize: 28, letterSpacing: 2 }}>TRAINER CARD</div>
          <div style={{ display: "flex", color: "rgba(248,239,216,0.8)", fontSize: 18 }}>PORTFOLIO.EXE</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", padding: "44px 48px 48px", gap: 26 }}>
          <div style={{ display: "flex", color: "#2A2A1E", fontSize: 56, letterSpacing: 1 }}>HANS VIDAURE</div>

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
            <div style={{ display: "flex", color: "#6b6a5a", fontSize: 16, letterSpacing: 1 }}>STATUS</div>
            <div style={{ display: "flex", color: "#146b6a", fontSize: 24 }}>FULL-STACK SOFTWARE ENGINEER</div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {SKILLS.map((skill) => (
              <div
                key={skill}
                style={{
                  display: "flex",
                  color: "#2A2A1E",
                  fontSize: 18,
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
