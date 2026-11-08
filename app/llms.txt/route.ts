import { llmsTxt } from "../lib/machineReadable";

// Built at deploy time from the same data as the pages.
export const dynamic = "force-static";

/** /llms.txt: the site's facts in plain text for AI assistants (llmstxt.org). */
export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
