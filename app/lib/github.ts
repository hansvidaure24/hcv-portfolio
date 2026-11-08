/**
 * Server components only. Public GitHub data for the trainer card and the CI chips on project cards.
 * Fetched on the server when the page is built and refreshed at most once a
 * day (Next's ISR), so visitors never call GitHub themselves and nothing here
 * costs money. Every function returns null instead of throwing: if GitHub is
 * down or rate-limits us, the site just leaves the live bits out.
 *
 * Without a token GitHub allows 60 requests an hour per IP; one refresh uses
 * about a dozen. Set GITHUB_TOKEN (a fine-grained token with read-only access
 * to public repositories, which is free) to raise that to 5,000.
 */

export const GITHUB_USER = "hansvidaure24";
const DAY = 60 * 60 * 24;

type FetchResult<T> = { status: number; data: T | null };

async function github<T>(path: string): Promise<FetchResult<T>> {
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "hansvidaure.dev",
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      next: { revalidate: DAY },
    });
    // 202 means GitHub is still computing a stats endpoint: no data yet.
    if (res.status !== 200) return { status: res.status, data: null };
    return { status: 200, data: (await res.json()) as T };
  } catch {
    return { status: 0, data: null };
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The repo name from a project's "Code" link, if it's one of Hans's GitHub repos. */
export function repoFromUrl(url: string | undefined): string | null {
  const match = url?.match(new RegExp(`^https://github\\.com/${GITHUB_USER}/([\\w.-]+)/?$`, "i"));
  return match?.[1] ?? null;
}

export type CiStatus = {
  /** Only passing runs are reported; see getCiStatus. */
  passing: true;
  /** ISO date of the run. */
  ranAt: string;
  url: string;
};

type WorkflowRun = {
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  html_url: string;
};

/**
 * The latest finished "CI" workflow run on the repo's main branch. Returns it
 * only when it passed: a chip that says "passing" must be true, and a repo
 * with a red or missing run simply shows no chip.
 */
export async function getCiStatus(repo: string): Promise<CiStatus | null> {
  const { data } = await github<{ workflow_runs: WorkflowRun[] }>(
    `/repos/${GITHUB_USER}/${repo}/actions/runs?branch=main&event=push&per_page=20`
  );
  const latest = data?.workflow_runs.find((run) => run.name === "CI" && run.status === "completed");
  if (!latest || latest.conclusion !== "success") return null;
  return { passing: true, ranAt: latest.created_at, url: latest.html_url };
}

type Repo = { name: string; fork: boolean; archived: boolean; pushed_at: string };

export type TrainerStats = {
  publicRepos: number;
  lastPush: { repo: string; at: string } | null;
  /** Commits Hans made to his public repos, one number per week, oldest first (52 weeks). */
  weeklyCommits: number[] | null;
};

/** Weekly commit counts by the repo owner for the last 52 weeks; retries while GitHub computes them. */
async function ownerCommitsByWeek(repo: string): Promise<number[] | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { status, data } = await github<{ owner: number[] }>(`/repos/${GITHUB_USER}/${repo}/stats/participation`);
    if (data?.owner?.length) return data.owner;
    if (status !== 202) return null;
    await wait(2000);
  }
  return null;
}

export async function getTrainerStats(): Promise<TrainerStats | null> {
  const { data: repos } = await github<Repo[]>(`/users/${GITHUB_USER}/repos?type=owner&sort=pushed&per_page=100`);
  if (!repos) return null;

  const own = repos.filter((r) => !r.fork);
  const latest = own[0];

  // All or nothing: a strip missing one repo would undercount without saying so.
  const perRepo = await Promise.all(own.filter((r) => !r.archived).map((r) => ownerCommitsByWeek(r.name)));
  const weeklyCommits = perRepo.every((weeks): weeks is number[] => weeks !== null && weeks.length === 52)
    ? perRepo.reduce<number[]>((sum, weeks) => sum.map((n, i) => n + weeks[i]!), new Array(52).fill(0))
    : null;

  return {
    publicRepos: own.length,
    lastPush: latest ? { repo: latest.name, at: latest.pushed_at } : null,
    weeklyCommits,
  };
}
