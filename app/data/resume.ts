/**
 * The resume as data, for the Quick view page (/resume). The PDF is still
 * printed from resume/hcv-resume.html, so keep the two in sync. The phone
 * number is only in the PDF, not on the public web page.
 */

export type ResumeLink = { label: string; href: string };

export type ResumeEntry = {
  /** Company, school, project or group. */
  name: string;
  /** Role or one-line description, shown after the name. */
  detail?: string;
  when?: string;
  /** Projects only: the stack in italics. */
  stack?: string;
  points: string[];
  links?: ResumeLink[];
  /** Projects only: the on-site case study. */
  caseStudy?: string;
};

export const RESUME = {
  name: "Hans Chandler Vidaure",
  headline: "Full-Stack Software Engineer",
  location: "Flushing, NY",
  contact: [
    { label: "contact@hansvidaure.dev", href: "mailto:contact@hansvidaure.dev" },
    { label: "github.com/hansvidaure24", href: "https://github.com/hansvidaure24" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/hans-chandler-vidaure/" },
  ] satisfies ResumeLink[],
  summary:
    "Full-stack engineer with 3 years at Fiserv building and securing online banking features for retail and business customers in C#, ASP.NET, React and SQL. Independently ships tested web apps and developer tools in TypeScript, JavaScript and Unity.",
  experience: [
    {
      name: "Fiserv",
      detail: "Software Development Engineer, Berkeley Heights, NJ",
      when: "Jan 2024 – Present",
      points: [
        "Shipped features and third-party integrations, building REST APIs and React UI in C#, ASP.NET and SQL",
        "Automated data maintenance with SQL scripts and a scheduled sync job, replacing manual work",
        "Worked production incidents from triage to resolution, and wrote runbooks for the team",
      ],
    },
    {
      name: "Fiserv",
      detail: "Technical Trainee, Berkeley Heights, NJ",
      when: "Sep 2023 – Jan 2024",
      points: [
        "Built a full-stack capstone in five months (React, Spring Boot REST API, MySQL) and presented it for stakeholder sign-off",
      ],
    },
    {
      name: "CUNY Building Performance Lab",
      detail: "Student Intern, New York, NY",
      when: "Nov 2022 – May 2023",
      points: ["Charted energy flow through heating and cooling systems in NYC buildings and presented ways to cut energy use"],
    },
  ] satisfies ResumeEntry[],
  projects: [
    {
      name: "SliceOfPie",
      detail: "offline receipt-scanning bill splitter",
      stack: "TypeScript, ONNX Runtime, Workbox, Playwright",
      caseStudy: "sliceofpie",
      links: [
        { label: "Live", href: "https://slice-of-pie-xi.vercel.app" },
        { label: "Code", href: "https://github.com/hansvidaure24/SliceOfPie" },
      ],
      points: [
        "Chose PaddleOCR over Tesseract.js after it read every price on 16/16 test receipts vs 4/16; runs offline in a Web Worker",
        "Reached 99 Lighthouse mobile performance with ~25 KB of startup JavaScript; 245 Vitest and Playwright tests run on every push",
      ],
    },
    {
      name: "Behavior Tree Editor",
      detail: "visual editor and Unity runtime for game AI",
      stack: "JavaScript, Canvas, Tauri (Rust), C#",
      caseStudy: "behavior-tree-editor",
      links: [
        { label: "Live", href: "https://hansvidaure24.github.io/Behavior-Tree-Editor/editor/" },
        { label: "Code", href: "https://github.com/hansvidaure24/Behavior-Tree-Editor" },
      ],
      points: [
        "Built a canvas node-graph editor with a replay debugger and sub-second hot reload into Unity, shipped as a 2.5 MB desktop app",
        "Drives my Unity game’s enemy AI; a test runs 14 trees through both runtimes for 9,000 ticks each and diffs every command",
      ],
    },
    {
      name: "Pocket Quest",
      detail: "phone-controlled co-op tactics RPG",
      stack: "JavaScript, WebRTC, Cloudflare Workers, Playwright",
      caseStudy: "pocket-quest",
      links: [
        { label: "Live", href: "https://hansvidaure24.github.io/Pocket-Quest/" },
        { label: "Code", href: "https://github.com/hansvidaure24/Pocket-Quest" },
      ],
      points: [
        "Built host-authoritative multiplayer over three fallback transports with auto-reconnect; players join by QR code, no install",
        "Wrote a CI self-play test in which bots play a full campaign in headless Chromium on every push",
      ],
    },
    {
      name: "RJN Visuals",
      detail: "client site for a photo and video studio",
      stack: "Next.js, React, TypeScript, SCSS",
      caseStudy: "rjn-visuals",
      links: [
        { label: "Live", href: "https://rjn-portfolio.vercel.app" },
        { label: "Code", href: "https://github.com/hansvidaure24/rjn-portfolio" },
      ],
      points: ["Designed and built a video-heavy portfolio and booking site with case studies, YouTube/Instagram embeds and a contact form"],
    },
  ] satisfies ResumeEntry[],
  education: [
    {
      name: "Queens College (CUNY)",
      detail: "B.A. Computer Science, Minor in French · Pi Delta Phi French Honor Society",
      when: "Aug 2019 – Sep 2023",
      points: [],
    },
  ] satisfies ResumeEntry[],
  leadership: [
    {
      name: "QC TROPA",
      detail: "Founder and President",
      when: "Aug 2022 – May 2023",
      points: [
        "Grew a Filipino cultural organization from zero to 30–40 active members; ran 8 meetings, 6 workshops and an annual festival",
      ],
    },
    {
      name: "Couples for Christ Youth",
      detail: "Household Leader",
      when: "Apr 2015 – Present",
      points: ["Lead monthly youth programs and leadership training, and run community service initiatives"],
    },
  ] satisfies ResumeEntry[],
  skills: [
    {
      label: "Languages and frameworks",
      text: "C#, TypeScript, JavaScript, SQL, Java, Python · ASP.NET, .NET, React, Next.js, Spring Boot, Unity",
    },
    {
      label: "Testing and DevOps",
      text: "Playwright, Vitest, unit testing, Git, GitHub Actions (CI/CD), Vercel, Cloudflare Workers",
    },
    { label: "Data and tools", text: "SQL Server, MySQL, JIRA, Confluence, ReSharper" },
    { label: "Practices", text: "REST API design, application security, secure code review, Agile/Scrum" },
    { label: "Spoken", text: "English, Tagalog (native) · French (intermediate; minor) · Spanish (basic)" },
  ],
};
