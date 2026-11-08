/**
 * Ten synthetic job posts for the Type Matchup tests, written for this repo
 * (no real company's text) in the formats real posts use: markdown and
 * plain headings, "Preferred qualifications", bullets, "is a plus" lines,
 * About-us blurbs and benefits, and words that look like skills but aren't.
 *
 * `required` / `nice`: dex or nearby ids that must land in that section.
 * `absent`: ids that must not appear at all.
 */
export type JobPostFixture = {
  name: string;
  text: string;
  required: string[];
  nice?: string[];
  absent?: string[];
  years?: number;
};

export const JOB_POSTS: JobPostFixture[] = [
  {
    name: ".NET backend, plain headings",
    text: `Software Engineer II, Payments Platform

About the role
You'll build and maintain the APIs that move money for our business customers.

Requirements:
- 3+ years of professional experience with C# and ASP.NET Core
- Strong SQL Server skills, including query tuning
- Experience designing REST APIs
- Familiarity with secure coding practices and remediating SAST findings

Preferred qualifications:
- Microsoft Azure and Azure DevOps pipelines
- Experience with Entity Framework

Benefits
Health insurance, 401(k) match, and a hybrid schedule.`,
    required: ["csharp", "aspnet", "sql", "rest", "appsec"],
    nice: ["azure", "ef"],
    years: 3,
  },
  {
    name: "Full-stack React and Node, markdown",
    text: `## What you'll do
Ship features across our web app, from the database to the UI.

## Requirements
- 2+ years of experience building web applications
- React and TypeScript
- Node.js and PostgreSQL
- Writing automated tests

## Nice to have
- AWS
- Docker
- GraphQL`,
    required: ["react", "typescript", "node", "postgres", "unittest"],
    nice: ["aws", "docker", "graphql"],
    years: 2,
  },
  {
    name: "Frontend with accessibility",
    text: `Frontend Engineer

You will:
* Build responsive interfaces in Next.js, with accessibility built in
* Own our design system's CSS and component library
* Keep Lighthouse scores high and Core Web Vitals green

You have:
* Strong React and JavaScript
* Experience with Jest or Playwright
* An eye for detail; Figma experience is a plus`,
    required: ["nextjs", "css", "perf", "react", "javascript", "jest", "playwright", "a11y"],
    nice: ["design"],
  },
  {
    name: "Java backend that mentions JavaScript only as a bonus",
    text: `Backend Engineer (Java)

Qualifications
- 4+ years of industry experience with Java and Spring Boot
- Microservices and message queues such as Kafka
- Comfortable with Linux and Bash

Bonus points
- Some JavaScript for internal tools`,
    required: ["java", "microservices", "queues", "linux"],
    nice: ["javascript"],
    years: 4,
  },
  {
    name: "Gameplay programmer",
    text: `GAMEPLAY PROGRAMMER

WHAT YOU'LL BRING
- Shipped titles or substantial projects in Unity with C#
- Online multiplayer networking (Netcode for GameObjects or similar)
- Enemy AI using behavior trees or state machines

NICE TO HAVE
- C++ and Unreal Engine
- Experience with URP shaders`,
    required: ["unity", "csharp", "realtime", "netcode", "gameai"],
    nice: ["cpp", "unreal", "urp"],
  },
  {
    name: "React Native mobile, which is not React web",
    text: `Mobile Engineer

Requirements:
- React Native in production
- Swift or Kotlin for native modules
- REST APIs and offline-first data sync`,
    required: ["react-native", "mobile", "rest", "pwa"],
    absent: ["react"],
  },
  {
    name: "Application security engineer",
    text: `Application Security Engineer

Responsibilities
- Lead secure code review and threat modeling with product teams
- Triage SAST results from Fortify and drive vulnerability remediation
- Track and close CVEs in third-party dependencies

Requirements
- Python for security tooling
- Understanding of OAuth and SSO`,
    required: ["appsec", "python", "auth"],
  },
  {
    name: "DevOps",
    text: `Platform / DevOps Engineer

Must have:
- Docker and Kubernetes (K8s)
- Terraform
- CI/CD with GitHub Actions
- Monitoring with Datadog

Nice to have:
- Cloudflare Workers`,
    required: ["docker", "kubernetes", "iac", "ci", "observability"],
    nice: ["cloudflare"],
  },
  {
    name: "Words that look like skills but aren't",
    text: `Customer Success Lead

We're building the next generation of tools for real estate teams. Spring into action
with us and go above and beyond for every customer. Our docs live at help.example.net.

Requirements:
- Great communication
- You enjoy a fast-paced environment and react quickly to change`,
    required: [],
    absent: ["nextjs", "java", "go", "dotnet", "react", "realtime"],
  },
  {
    name: "Startup generalist with a range of years and an About us",
    text: `About us
We run on Kubernetes and Go across the company.

The role
Own features end to end in C#/.NET and React.

Requirements
- 5-7 years of software engineering experience
- C/C++ is helpful but not required
- Strong SQL

Preferred
- Experience with Vercel deployments`,
    required: ["csharp", "dotnet", "react", "sql"],
    nice: ["cpp", "deploy"],
    absent: ["kubernetes", "go"],
    years: 5,
  },
];
