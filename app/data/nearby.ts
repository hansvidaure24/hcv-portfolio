/**
 * Skills job posts often ask for that aren't in the Skill Dex (no proof on
 * the site), each with the nearest dex entries. Type Matchup shows these as
 * "Closest experience" instead of pretending to a match. Add one here when a
 * real job post asks for something the matcher doesn't recognize.
 *
 * Aliases follow the dex rules: no common English words, and short all-caps
 * acronyms ("AWS") only match in capitals.
 */
export type NearbySkill = {
  id: string;
  name: string;
  aliases: string[];
  /** Dex ids, nearest first. */
  closest: string[];
};

export const NEARBY: NearbySkill[] = [
  { id: "docker", name: "Docker", aliases: ["containers", "containerization"], closest: ["ci", "deploy"] },
  { id: "kubernetes", name: "Kubernetes", aliases: ["K8s"], closest: ["deploy", "cloudflare"] },
  { id: "aws", name: "AWS", aliases: ["Amazon Web Services", "AWS Lambda", "EC2"], closest: ["cloudflare", "deploy"] },
  { id: "azure", name: "Azure", aliases: ["Microsoft Azure", "Azure DevOps"], closest: ["dotnet", "ci"] },
  { id: "gcp", name: "Google Cloud", aliases: ["GCP"], closest: ["cloudflare", "deploy"] },
  { id: "node", name: "Node.js", aliases: ["NodeJS", "Express.js"], closest: ["javascript", "cloudflare"] },
  { id: "angular", name: "Angular", aliases: ["AngularJS"], closest: ["react", "typescript"] },
  { id: "vue", name: "Vue", aliases: ["Vue.js", "Nuxt"], closest: ["react", "nextjs"] },
  { id: "react-native", name: "React Native", aliases: [], closest: ["react", "pwa"] },
  { id: "mobile", name: "Native mobile", aliases: ["Swift", "Kotlin", "SwiftUI", "iOS development", "Android development"], closest: ["pwa", "react"] },
  { id: "postgres", name: "PostgreSQL", aliases: ["Postgres"], closest: ["sql"] },
  { id: "nosql", name: "NoSQL", aliases: ["MongoDB", "DynamoDB", "Cosmos DB"], closest: ["sql"] },
  { id: "redis", name: "Redis", aliases: ["caching"], closest: ["concurrency", "sql"] },
  { id: "graphql", name: "GraphQL", aliases: [], closest: ["rest"] },
  { id: "queues", name: "Message queues", aliases: ["Kafka", "RabbitMQ", "event-driven", "Service Bus"], closest: ["concurrency", "rest"] },
  { id: "microservices", name: "Microservices", aliases: ["distributed systems"], closest: ["rest", "concurrency"] },
  { id: "iac", name: "Infrastructure as code", aliases: ["Terraform", "IaC", "Bicep", "CloudFormation"], closest: ["ci", "deploy"] },
  // Not bare "Go": "Go above and beyond" would match. Posts that say only "Go" are missed.
  { id: "go", name: "Go (Golang)", aliases: ["Golang"], closest: ["csharp", "typescript"] },
  { id: "rust", name: "Rust", aliases: [], closest: ["tauri"] },
  { id: "cpp", name: "C++", aliases: [], closest: ["csharp"] },
  { id: "ruby", name: "Ruby", aliases: ["Ruby on Rails", "Rails"], closest: ["typescript", "rest"] },
  { id: "php", name: "PHP", aliases: ["Laravel"], closest: ["typescript", "rest"] },
  { id: "ml", name: "Machine learning", aliases: ["PyTorch", "TensorFlow", "LLMs", "LLM", "deep learning"], closest: ["onnx", "python"] },
  { id: "jest", name: "Jest", aliases: ["Cypress", "Selenium", "xUnit", "MSTest"], closest: ["unittest", "playwright"] },
  { id: "agile", name: "Agile", aliases: ["Scrum", "Kanban"], closest: ["git", "incidents"] },
  { id: "linux", name: "Linux", aliases: ["Bash", "shell scripting", "PowerShell"], closest: ["ci", "git"] },
  { id: "design", name: "Figma", aliases: ["UI/UX design", "UX design"], closest: ["css", "a11y"] },
  { id: "ef", name: "Entity Framework", aliases: ["EF Core", "LINQ", "Dapper"], closest: ["dotnet", "sql"] },
  { id: "blazor", name: "Blazor", aliases: ["Razor"], closest: ["aspnet", "react"] },
  { id: "auth", name: "Authentication", aliases: ["OAuth", "OAuth 2.0", "OpenID Connect", "OIDC", "SSO", "JWT"], closest: ["appsec", "rest"] },
  { id: "unreal", name: "Unreal Engine", aliases: ["Unreal", "Godot"], closest: ["unity", "gameai"] },
  { id: "sast", name: "Vulnerability scanning", aliases: ["SAST", "CVE", "vulnerability remediation"], closest: ["appsec"] },
  { id: "threads", name: "Multithreading", aliases: ["thread safety", "parallel processing"], closest: ["concurrency"] },
  { id: "observability", name: "Observability", aliases: ["monitoring", "logging", "Datadog", "Splunk", "Grafana", "OpenTelemetry"], closest: ["incidents"] },
];
