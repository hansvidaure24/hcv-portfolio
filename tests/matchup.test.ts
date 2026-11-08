import { describe, expect, it } from "vitest";
import { JOB_POSTS } from "./fixtures/jobPosts";
import {
  decodeMatchup,
  encodeMatchup,
  matchPost,
  projectScore,
  summarize,
  summaryLine,
  yearsOfExperience,
} from "../app/lib/matchup";
import { CORE_DEX_IDS, DEX, dexEntryFor } from "../app/data/dex";
import { NEARBY } from "../app/data/nearby";
import { getDraftProjects, getPublishedProjects } from "../app/data/projects";

const NOW = new Date("2026-11-08T12:00:00Z");

describe.each(JOB_POSTS)("job post: $name", (post) => {
  const m = matchPost(post.text, NOW);
  const sectionOf = (id: string) => m.rows.find((r) => r.id === id)?.section;

  it("finds the required skills, as required", () => {
    for (const id of post.required) expect(sectionOf(id), id).toBe("required");
  });

  it("finds the nice-to-have skills, as nice to have", () => {
    for (const id of post.nice ?? []) expect(sectionOf(id), id).toBe("nice");
  });

  it("finds nothing else (no false matches)", () => {
    const expected = [...post.required, ...(post.nice ?? [])].sort();
    expect(m.rows.map((r) => r.id).sort()).toEqual(expected);
  });

  it("leaves out what it must not claim", () => {
    for (const id of post.absent ?? []) expect(sectionOf(id), id).toBeUndefined();
  });

  it("reads the years asked for", () => {
    expect(m.years?.asked).toBe(post.years);
  });
});

describe("effectiveness", () => {
  const m = matchPost("Requirements:\n- C#, TypeScript, Netcode for GameObjects and Docker", NOW);
  const row = (id: string) => m.rows.find((r) => r.id === id)!;

  it("is super effective for skills used at Fiserv", () => expect(row("csharp").effect).toBe("super"));
  it("is effective for skills shipped in projects", () => expect(row("typescript").effect).toBe("effective"));
  it("is effective for skills seen in a game in development", () => expect(row("netcode").effect).toBe("effective"));

  it("offers closest experience, with proof, for skills not in the dex", () => {
    const docker = row("docker");
    expect(docker.effect).toBe("closest");
    expect(docker.kind === "nearby" && docker.closest.map((e) => e.id)).toEqual(["ci", "deploy"]);
  });

  it("sorts super effective, then effective, then closest", () => {
    expect(m.rows.map((r) => r.effect)).toEqual(["super", "effective", "effective", "closest"]);
  });
});

describe("summary", () => {
  it("counts required and nice-to-have skills", () => {
    const m = matchPost(JOB_POSTS[0]!.text, NOW);
    expect(summarize(m)).toEqual({ required: 5, requiredSuper: 5, requiredMatched: 5, nice: 2, niceMatched: 0 });
    expect(summaryLine(m)).toBe("5 of 5 required skills: super effective!");
  });

  it("says so when it recognizes nothing", () => {
    expect(summaryLine(matchPost("COBOL and Fortran on the mainframe.", NOW))).toBe("No skills I know turned up in that post.");
  });

  it("compares years asked with years since the first full-time role", () => {
    expect(yearsOfExperience(NOW)).toBe(3);
    expect(matchPost("- 5+ years of experience", NOW).years).toEqual({ asked: 5, has: 3, section: "required" });
  });
});

describe("matchup link", () => {
  it("round-trips skill ids, sections and years, and never the post's text", () => {
    for (const post of JOB_POSTS) {
      const m = matchPost(post.text, NOW);
      const encoded = encodeMatchup(m);
      expect(encoded).not.toMatch(/\s/);
      const back = decodeMatchup(encoded, NOW);
      if (!m.rows.length && !m.years) {
        expect(back).toBeNull();
        continue;
      }
      expect(back!.rows.map((r) => `${r.section}:${r.id}`)).toEqual(m.rows.map((r) => `${r.section}:${r.id}`));
      expect(back!.years?.asked).toBe(m.years?.asked);
    }
  });

  it("ignores ids it doesn't know", () => {
    expect(decodeMatchup("<script>,nope,~csharp", NOW)!.rows.map((r) => r.id)).toEqual(["csharp"]);
  });
});

describe("project order", () => {
  const projects = getPublishedProjects();
  const ranked = (text: string) => {
    const m = matchPost(text, NOW);
    return [...projects].sort((a, b) => projectScore(b, m, dexEntryFor) - projectScore(a, m, dexEntryFor)).map((p) => p.slug);
  };

  it("puts game work first for a game post", () => {
    expect(ranked(JOB_POSTS[4]!.text).slice(0, 2).sort()).toEqual(["behavior-tree-editor", "nebula"]);
  });

  it("puts web apps first for a frontend post", () => {
    expect(["sliceofpie", "rjn-visuals"]).toContain(ranked(JOB_POSTS[2]!.text)[0]);
  });
});

describe("data the matcher depends on", () => {
  it("matches every project stack chip, drafts included, to a dex entry", () => {
    const chips = [...getPublishedProjects(), ...getDraftProjects()].flatMap((p) => p.stack);
    expect(chips.filter((chip) => !dexEntryFor(chip))).toEqual([]);
  });

  it("never uses the same name for two skills", () => {
    const names = [...DEX, ...NEARBY].flatMap((s) => [s.name, ...s.aliases].map((n) => n.toLowerCase()));
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([]);
  });

  it("points nearby skills at real dex entries", () => {
    const ids = new Set(DEX.map((e) => e.id));
    expect(NEARBY.flatMap((s) => s.closest.filter((id) => !ids.has(id)))).toEqual([]);
  });

  it("features only real, used skills in the core list", () => {
    const byId = new Map(DEX.map((e) => [e.id, e]));
    expect(CORE_DEX_IDS.filter((id) => byId.get(id)?.status !== "caught")).toEqual([]);
    expect(new Set(CORE_DEX_IDS).size).toBe(CORE_DEX_IDS.length);
  });

  it("gives every dex entry evidence", () => {
    expect(DEX.filter((e) => e.evidence.length === 0).map((e) => e.id)).toEqual([]);
  });
});

describe("machine-readable files", async () => {
  const { jsonResume, llmsTxt, parseRange, skillEvidence } = await import("../app/lib/machineReadable");

  it("reads resume date ranges", () => {
    expect(parseRange("Jan 2024 – Present")).toEqual({ startDate: "2024-01", endDate: undefined });
    expect(parseRange("Sep 2023 – Jan 2024")).toEqual({ startDate: "2023-09", endDate: "2024-01" });
  });

  it("builds a JSON Resume without the phone number", () => {
    const r = jsonResume();
    expect(r.basics.name).toBe("Hans Chandler Vidaure");
    expect(r.work[0]).toMatchObject({ name: "Fiserv", position: "Software Development Engineer", startDate: "2024-01" });
    expect(JSON.stringify(r)).not.toMatch(/347|0601/);
  });

  it("writes llms.txt in the llmstxt.org shape, with every published project", () => {
    const txt = llmsTxt();
    expect(txt.startsWith("# Hans Chandler Vidaure")).toBe(true);
    expect(txt).toMatch(/^> /m);
    for (const slug of ["sliceofpie", "behavior-tree-editor", "pocket-quest"]) expect(txt).toContain(`/projects/${slug}`);
    expect(txt).not.toMatch(/347|0601/);
  });

  it("answers skill questions by alias, and points unknown skills at the closest ones", () => {
    expect(skillEvidence("ASP.NET Core")).toMatchObject({ found: true, skill: { name: "ASP.NET", usedAtWork: true } });
    const docker = skillEvidence("Docker");
    expect(docker.found).toBe(false);
    expect(!docker.found && docker.closest.map((s) => s.name)).toEqual(["GitHub Actions", "Deployment"]);
  });
});

describe("spoken languages", async () => {
  const { spokenLanguages } = await import("../app/lib/machineReadable");
  it("applies a group's level to every language in it", () => {
    expect(spokenLanguages("English, Tagalog (native) · French (intermediate; minor) · Spanish (basic)")).toEqual([
      { language: "English", fluency: "Native" },
      { language: "Tagalog", fluency: "Native" },
      { language: "French", fluency: "Intermediate" },
      { language: "Spanish", fluency: "Basic" },
    ]);
  });
});
