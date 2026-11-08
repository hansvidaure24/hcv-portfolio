import { jsonResume } from "../lib/machineReadable";

export const dynamic = "force-static";

/** /resume.json: the resume in the JSON Resume schema (jsonresume.org). No phone number. */
export function GET() {
  return Response.json(jsonResume(), { headers: { "Access-Control-Allow-Origin": "*" } });
}
