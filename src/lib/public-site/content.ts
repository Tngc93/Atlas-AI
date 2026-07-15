export type PublicPageContent = {
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  summary: string;
  principles: readonly string[];
  workflow: readonly string[];
  visual: "dashboard" | "forecast" | "decision" | "timeline" | "reminders" | "coach" | "architecture" | "repository" | "database" | "deployment" | "docs" | "security" | "roadmap" | "github";
  sections: readonly { title: string; body: string }[];
  links?: readonly { title: string; description: string; href: string }[];
  related: readonly string[];
  sourceFile?: string;
};

const productRelated = ["/product/forecast", "/product/decision-simulator", "/architecture"] as const;

export const productPages: Record<string, PublicPageContent> = {
  "": {
    path: "/product", eyebrow: "Product", title: "One explainable workspace for financial decisions.",
    description: "Explore the Atlas AI product system: deterministic calculations, visible forecasts, reversible scenarios, financial memory, reminders and optional AI explanations.",
    summary: "Atlas AI keeps every product module connected to one deterministic source of truth. The interface helps users understand current reality, examine future paths and make their own decisions without handing calculation authority to a model.",
    principles: ["Deterministic at the core", "Scenarios never mutate saved data", "AI remains an optional explanation layer", "Infrastructure stays under operator control"],
    workflow: ["Dashboard", "Forecast Engine", "Decision Simulator", "Financial Memory", "Reminder Engine", "AI Coach"], visual: "dashboard",
    sections: [
      { title: "See the whole picture", body: "The dashboard assembles safe budget, debt pressure, risk signals, upcoming obligations and recent financial context into a single review surface." },
      { title: "Explore before committing", body: "Forecast and decision modules expose assumptions and trade-offs before a user changes stored financial information." },
      { title: "Keep context over time", body: "Financial Memory and reminders preserve deterministic snapshots, trends and review moments without turning AI into a memory store." },
      { title: "Explain, never calculate", body: "The AI Coach receives minimized deterministic context and explains results in educational language. It cannot replace the finance engine." },
    ], related: ["/architecture", "/docs/getting-started", "/demo"],
  },
  dashboard: {
    path: "/product/dashboard", eyebrow: "Product · Dashboard", title: "Your financial position, made legible.",
    description: "A product overview of the Atlas AI dashboard and its deterministic financial summary.",
    summary: "The dashboard is the review layer for Atlas AI. It combines fictional or self-hosted inputs with calculated safe budget, risk, debt reduction, forecasts and memory signals while keeping assumptions visible.",
    principles: ["Safe budget before extra payoff", "Risk reasons remain visible", "Fictional demo data is clearly labeled", "Every metric links back to deterministic logic"],
    workflow: ["Validated inputs", "Finance plan", "Risk signals", "Dashboard summary", "User review"], visual: "dashboard",
    sections: [
      { title: "A calm operating picture", body: "High-priority numbers are grouped by decision relevance rather than database structure. Users see what is protected, what is changing and what needs review." },
      { title: "Evidence beside conclusions", body: "Risk levels, forecast direction and debt progress are accompanied by reasons and time context, reducing black-box interpretation." },
      { title: "Designed for review", body: "The dashboard does not trigger irreversible financial actions. It helps the user inspect evidence and continue into forecasts, decisions or memory." },
    ], related: productRelated,
  },
  forecast: {
    path: "/product/forecast", eyebrow: "Product · Forecast Engine", title: "See the assumptions behind the next 24 months.",
    description: "Understand Atlas AI deterministic forecasts, visible assumptions, milestones and scenario comparisons.",
    summary: "Forecasts extend the current financial plan across 3, 6, 12 or 24 months. Salary, mandatory expenses, rates, minimum payments and payoff strategy remain explicit inputs—not hidden model guesses.",
    principles: ["Visible horizon and assumptions", "Deterministic month-by-month projection", "Debt milestones remain traceable", "Forecasts are scenarios, not guarantees"],
    workflow: ["Current plan", "Forecast assumptions", "Monthly projection", "Risk and payoff milestones", "User interpretation"], visual: "forecast",
    sections: [
      { title: "Project from known rules", body: "The engine rolls forward deterministic cash flow and debt behavior using the selected horizon and documented assumptions." },
      { title: "Make uncertainty visible", body: "Forecast language distinguishes calculated projection from certainty. Missing or stale rate information remains visible to the user." },
      { title: "Compare without committing", body: "Temporary forecast scenarios show deltas against the current plan without changing the stored baseline." },
    ], related: ["/product/decision-simulator", "/product/financial-memory", "/docs/testing"],
  },
  "decision-simulator": {
    path: "/product/decision-simulator", eyebrow: "Product · Decision Simulator", title: "Compare trade-offs before changing reality.",
    description: "Explore reversible, deterministic financial scenarios in the Atlas AI Decision Simulator.",
    summary: "The simulator evaluates hypothetical salary, payment and expense changes against the current plan. Every result is local to the scenario until the user explicitly decides otherwise.",
    principles: ["Local mock state", "No automatic persistence", "Delta against current plan", "User remains decision owner"],
    workflow: ["Choose a scenario", "Adjust a fictional input", "Recalculate deterministically", "Compare deltas", "Discard or review"], visual: "decision",
    sections: [
      { title: "Reversible by default", body: "Scenario inputs are isolated from the saved financial plan, allowing exploration without accidental changes." },
      { title: "Trade-offs, not recommendations", body: "Results show safe-budget, payoff and risk differences. The system does not present one scenario as universally correct." },
      { title: "The same finance rules", body: "Simulations reuse the deterministic calculation engine so scenario outputs remain consistent with the dashboard." },
    ], related: ["/product/forecast", "/architecture/finance-engine", "/demo"],
  },
  "financial-memory": {
    path: "/product/financial-memory", eyebrow: "Product · Financial Memory", title: "Preserve financial context over time.",
    description: "Learn how deterministic monthly snapshots reveal debt, budget and risk trends without becoming AI memory.",
    summary: "Financial Memory stores structured monthly snapshots and derives minimized trend signals. It helps users understand change over time while keeping raw records behind repository boundaries.",
    principles: ["Deterministic snapshots", "Minimized trend signals", "No AI-owned memory", "Context without hidden profiling"],
    workflow: ["Monthly plan", "Snapshot", "Trend analysis", "Review context", "Optional explanation"], visual: "timeline",
    sections: [
      { title: "Snapshots, not surveillance", body: "Atlas records selected financial plan outputs at meaningful review points instead of collecting an opaque behavior stream." },
      { title: "Trends with evidence", body: "Debt direction, safe-budget movement and risk changes are derived from snapshots and shown with their period context." },
      { title: "Minimized AI context", body: "Only reduced directions, bands and labels may enter Coach Context. Raw rows and private notes remain outside AI prompts." },
    ], related: ["/product/dashboard", "/product/ai-coach", "/architecture/repository"],
  },
  reminders: {
    path: "/product/reminders", eyebrow: "Product · Reminder Engine", title: "Bring critical review moments into view.",
    description: "Understand deterministic reminders for due dates, thresholds and financial review moments.",
    summary: "The Reminder Engine derives actionable review moments from dates and plan signals. It helps users notice obligations without manufacturing urgency or using AI to invent alerts.",
    principles: ["Rule-based reminders", "Visible due-date thresholds", "No shame or pressure", "User-controlled review"],
    workflow: ["Financial dates", "Threshold rules", "Reminder state", "User review", "Dismiss or resolve"], visual: "reminders",
    sections: [
      { title: "Deterministic triggers", body: "Due-date proximity and plan thresholds are evaluated by testable rules with a documented default risk window." },
      { title: "Calm language", body: "Reminder copy communicates timing and consequences without blame, artificial scarcity or action pressure." },
      { title: "Connected to the plan", body: "Reminders reference the same minimum-payment and safe-budget protections used by the finance engine." },
    ], related: ["/product/dashboard", "/product/financial-memory", "/docs/getting-started"],
  },
  "ai-coach": {
    path: "/product/ai-coach", eyebrow: "Product · AI Coach", title: "Explain deterministic results without replacing them.",
    description: "Explore Atlas AI's provider-independent explanation layer, guardrails and minimized Coach Context.",
    summary: "The AI Coach translates deterministic results into educational summaries, trade-off framing and review questions. Provider failure never removes access to the underlying calculations.",
    principles: ["AI never calculates financial truth", "Structured output validation", "Minimized Coach Context", "Mock-first fallback"],
    workflow: ["Deterministic outputs", "Context minimization", "Provider registry", "Validated explanation", "User review"], visual: "coach",
    sections: [
      { title: "Subordinate to evidence", body: "AI receives calculated summaries and cannot override budgets, risks, payoff order or forecast results." },
      { title: "Provider-independent", body: "The registry normalizes supported providers while preserving the same context, schema and deterministic boundaries." },
      { title: "Safe failure", body: "Missing credentials, timeouts or invalid output return a controlled fallback instead of breaking financial features." },
    ], related: ["/architecture/ai-provider-registry", "/docs/ai-providers", "/security"],
  },
};

export const architecturePages: Record<string, PublicPageContent> = {
  "": {
    path: "/architecture", eyebrow: "Architecture", title: "Clear boundaries. Replaceable layers.",
    description: "A complete view of Atlas AI's deterministic finance, repository, database and provider boundaries.",
    summary: "Atlas AI separates presentation, financial truth, persistence and AI explanation so each layer can be tested, replaced and operated without changing the authority of deterministic calculations.",
    principles: ["Finance Engine owns calculations", "Repositories isolate persistence", "PostgreSQL stays server-side", "AI is an optional explanation layer"],
    workflow: ["User", "Finance Engine", "Repository", "Database", "AI Provider Registry"], visual: "architecture",
    sections: [
      { title: "A deterministic center", body: "Finance calculations operate on validated domain inputs and remain independent from database records, UI state and model providers." },
      { title: "Controlled data boundaries", body: "Repositories map persistence records into domain types, keeping Prisma and credentials out of client components." },
      { title: "Optional intelligence", body: "The provider registry receives minimized summaries only after deterministic services have produced the result." },
    ], related: ["/architecture/finance-engine", "/architecture/repository", "/docs/security"],
  },
  "finance-engine": {
    path: "/architecture/finance-engine", eyebrow: "Architecture · Finance Engine", title: "Financial truth stays deterministic.",
    description: "How Atlas AI calculates cash flow, safe budget, risk, debt allocation and projections.",
    summary: "Pure, testable services calculate monthly allocation, living-budget protection, debt priority, payment coverage and payoff projections. AI providers are not dependencies of this layer.",
    principles: ["Integer or Decimal money", "Mandatory expenses protected first", "Minimum payments before extra payoff", "Avalanche strategy by default"],
    workflow: ["Validated inputs", "Cash-flow rules", "Debt allocation", "Risk classification", "Monthly finance plan"], visual: "forecast",
    sections: [
      { title: "Guarded inputs", body: "Schemas reject invalid numbers, impossible dates and unsafe edge cases before calculations begin." },
      { title: "Explicit priorities", body: "Living expenses and minimum payments are secured before extra payoff is considered. Negative cash flow is handled directly." },
      { title: "Testable outputs", body: "The engine returns structured plans that forecast, decision, memory and explanation layers consume without duplicating rules." },
    ], related: ["/product/forecast", "/docs/testing", "/architecture/repository"],
  },
  repository: {
    path: "/architecture/repository", eyebrow: "Architecture · Repository", title: "Persistence behind a stable boundary.",
    description: "How Atlas AI separates finance services from Prisma, PostgreSQL and demo storage.",
    summary: "Repository interfaces provide controlled access to financial records. Domain services receive mapped finance types rather than raw Prisma rows, preserving testability and execution-mode isolation.",
    principles: ["No raw Prisma in UI", "Domain mapping at the boundary", "Demo and self-host remain explicit", "Server-only credentials"],
    workflow: ["Domain request", "Repository contract", "Execution-mode adapter", "Mapped record", "Domain service"], visual: "repository",
    sections: [
      { title: "One contract, explicit modes", body: "Self-host mode uses PostgreSQL repositories while public demo mode uses isolated in-tab state. The application never silently switches between them." },
      { title: "Mapping protects the domain", body: "Persistence-specific shapes are converted before they reach finance calculations or presentation components." },
      { title: "A test seam", body: "Repository contracts allow pure services to be exercised with fictional data and guarded integration suites." },
    ], related: ["/architecture/database", "/docs/demo-mode", "/docs/postgresql"],
  },
  database: {
    path: "/architecture/database", eyebrow: "Architecture · Database", title: "Your PostgreSQL. Your operational boundary.",
    description: "Understand Atlas AI PostgreSQL storage, Prisma boundaries and deployment responsibilities.",
    summary: "Self-host mode uses PostgreSQL through server-side Prisma repositories. Pooled runtime and direct migration connections stay in environment secrets and never enter public pages or client bundles.",
    principles: ["PostgreSQL datasource", "Server-side Prisma only", "Reviewed migrations", "No public multi-user claims without Auth"],
    workflow: ["Repository", "Prisma adapter", "Pooled connection", "PostgreSQL", "Backup and migration operations"], visual: "database",
    sections: [
      { title: "Operator-controlled storage", body: "Teams choose and operate their compatible PostgreSQL environment, including TLS, credentials, backups and recovery." },
      { title: "Safe migration discipline", body: "Archived SQLite migrations are never applied to PostgreSQL. Production changes require a reviewed baseline and deployment runbook." },
      { title: "Ownership before public data", body: "PostgreSQL alone does not make the product safe for public multi-user data; authentication and owner-scoped authorization are required." },
    ], related: ["/docs/postgresql", "/architecture/self-hosting", "/security"],
  },
  "ai-provider-registry": {
    path: "/architecture/ai-provider-registry", eyebrow: "Architecture · AI Provider Registry", title: "Replace the provider. Preserve the boundary.",
    description: "How Atlas AI normalizes Mock, local and server-side AI providers without changing financial truth.",
    summary: "The registry describes provider capability, execution mode, credentials and availability. Every provider receives the same minimized deterministic context and must return validated structured explanations.",
    principles: ["Provider choice cannot change calculations", "Credentials stay outside context", "No automatic browser retries", "Mock fallback remains available"],
    workflow: ["Coach Context", "Capability check", "Provider adapter", "Schema validation", "Explanation or fallback"], visual: "coach",
    sections: [
      { title: "Capabilities are explicit", body: "Browser, local and server-side providers have different security boundaries. The registry does not pretend every adapter is safe everywhere." },
      { title: "Structured responses", body: "Provider output is validated before display. Invalid JSON, timeouts and missing credentials produce a controlled fallback." },
      { title: "Context minimization", body: "Raw rows, private notes, account identifiers and credentials do not enter Coach Context." },
    ], related: ["/product/ai-coach", "/docs/ai-providers", "/security"],
  },
  "self-hosting": {
    path: "/architecture/self-hosting", eyebrow: "Architecture · Self-hosting", title: "Run Atlas AI inside your own boundary.",
    description: "A technical overview of self-host deployment, PostgreSQL, provider credentials and current safety limits.",
    summary: "Self-host mode is designed for single-user development and controlled environments. Operators supply PostgreSQL and optional AI credentials while retaining responsibility for authentication, deployment and updates.",
    principles: ["No vendor-owned database requirement", "Mock works without AI credentials", "Secrets remain server-side", "Public multi-user use requires Auth"],
    workflow: ["Clone", "Configure environment", "Generate Prisma client", "Validate and build", "Operate and update"], visual: "deployment",
    sections: [
      { title: "Bring the stack", body: "Atlas AI runs with compatible PostgreSQL and supports Mock, local or configured server-side provider adapters." },
      { title: "Know the current boundary", body: "The current repository does not include production-ready multi-user authentication and ownership isolation." },
      { title: "Operate deliberately", body: "TLS, least-privilege credentials, backups, migrations, monitoring and provider quotas remain operator responsibilities." },
    ], related: ["/docs/self-hosting", "/docs/security", "/architecture/database"],
  },
};

export const docsPages: Record<string, PublicPageContent> = {
  "": {
    path: "/docs", eyebrow: "Documentation", title: "Understand the system. Operate it with confidence.",
    description: "Atlas AI documentation for product behavior, architecture, providers, PostgreSQL, testing, security and self-hosting.",
    summary: "Documentation is organized around the decisions developers and operators need to make: evaluate safely, understand deterministic boundaries, configure infrastructure and validate changes.",
    principles: ["Getting Started", "Architecture", "Product", "Open Source", "Resources"],
    workflow: ["Evaluate", "Understand", "Configure", "Validate", "Operate"], visual: "docs",
    sections: [
      { title: "Getting Started", body: "Run the zero-cost demo, understand execution modes and choose a safe first setup." },
      { title: "Architecture", body: "Trace calculations, persistence and AI explanation through explicit system boundaries." },
      { title: "Product", body: "Understand forecasts, decisions, memory, reminders and the AI Coach as one connected system." },
      { title: "Open Source", body: "Review contribution, security, roadmap and licensing guidance from repository sources." },
    ],
    links: [
      { title: "Getting Started", description: "Choose an execution mode and validate the prerequisites.", href: "/docs/getting-started" },
      { title: "Installation", description: "Install dependencies and generate the local runtime safely.", href: "/docs/installation" },
      { title: "Configuration", description: "Understand environment variables, providers and database boundaries.", href: "/docs/configuration" },
      { title: "Running Locally", description: "Start Atlas AI with Mock AI and a controlled local setup.", href: "/docs/running-locally" },
      { title: "Demo Mode", description: "Evaluate the product with fictional, non-persistent data.", href: "/docs/demo-mode" },
      { title: "Architecture", description: "Trace deterministic calculations through replaceable layers.", href: "/architecture" },
      { title: "FAQ", description: "Review common product, privacy and deployment questions.", href: "/docs/faq" },
      { title: "Self-hosting", description: "Operate Atlas AI inside infrastructure you control.", href: "/docs/self-hosting" },
      { title: "Roadmap", description: "See implemented, active and planned product directions.", href: "/roadmap" },
      { title: "API Overview", description: "Understand the current server boundary and public API surface.", href: "/docs/api-overview" },
      { title: "Contributing", description: "Set up a change and run the repository quality gates.", href: "/contributing" },
    ], related: ["/docs/getting-started", "/architecture", "/contributing"],
  },
  "getting-started": {
    path: "/docs/getting-started", eyebrow: "Docs · Getting Started", title: "Start with a safe, explainable Atlas AI setup.", description: "Install Atlas AI, choose demo or self-host mode, and validate the local environment.",
    summary: "Begin with fictional data and Mock AI. The repository README remains the source of truth for installation, scripts, execution modes and project status.", principles: ["Node.js 20+", "Mock-first evaluation", "Fictional data only", "Validate before operation"], workflow: ["Clone", "Install", "Configure", "Generate", "Run"], visual: "deployment",
    sections: [{ title: "Choose an execution mode", body: "Use public demo mode for database-free evaluation or self-host mode with PostgreSQL for controlled local operation." }, { title: "Keep secrets local", body: "Copy the environment template and provide values through ignored local files or deployment secret stores." }], related: ["/docs/demo-mode", "/docs/self-hosting", "/demo"], sourceFile: "README.md",
  },
  installation: {
    path: "/docs/installation", eyebrow: "Docs · Installation", title: "Install the repository without weakening its boundaries.", description: "Atlas AI prerequisites, dependency installation, Prisma generation and first validation steps.",
    summary: "Installation prepares a local development environment; it does not configure production safety. Start with the supported Node.js runtime, install the locked dependencies and generate the Prisma client before choosing an execution mode.",
    principles: ["Use the locked dependency graph", "Keep environment files ignored", "Generate Prisma explicitly", "Validate before first run"], workflow: ["Clone", "Install", "Copy safe defaults", "Generate", "Validate"], visual: "deployment",
    sections: [
      { title: "Prerequisites", body: "Use the Node.js version documented by the repository, npm and a compatible PostgreSQL environment only when self-host mode is required." },
      { title: "Install reproducibly", body: "Use npm ci for a clean dependency installation. Do not casually upgrade packages or rewrite the lockfile during setup." },
      { title: "Generate, then verify", body: "Generate the Prisma client and run lint, unit tests and a build before adding provider credentials or real infrastructure." },
    ], related: ["/docs/getting-started", "/docs/configuration", "/docs/running-locally"],
  },
  configuration: {
    path: "/docs/configuration", eyebrow: "Docs · Configuration", title: "Make every execution boundary explicit.", description: "Configuration guidance for demo mode, PostgreSQL, AI providers and local secrets.",
    summary: "Atlas AI configuration separates public demo, self-host database access and optional AI providers. Environment values choose capabilities; they never transfer calculation authority away from the finance engine.",
    principles: ["Mock is the safe default", "Secrets stay server-side", "Demo mode stays database-free", "Capabilities are provider-specific"], workflow: ["Choose mode", "Copy template", "Set server secrets", "Validate capability", "Run checks"], visual: "repository",
    sections: [
      { title: "Execution mode first", body: "Decide whether the process is a public fictional demo or a controlled self-host environment before supplying database or provider configuration." },
      { title: "Database configuration", body: "Runtime and migration connections use separate PostgreSQL URLs with TLS and least-privilege credentials managed outside the repository." },
      { title: "Provider configuration", body: "Mock requires no key. Local, experimental browser and self-host providers expose different capabilities and security boundaries." },
    ], related: ["/docs/demo-mode", "/docs/postgresql", "/docs/ai-providers"],
  },
  "running-locally": {
    path: "/docs/running-locally", eyebrow: "Docs · Local Development", title: "Run locally with a visible, reversible setup.", description: "Local Atlas AI startup, safe defaults, validation and troubleshooting guidance.",
    summary: "The lowest-risk local path starts with fictional data and Mock AI. Add PostgreSQL or another provider only after the base product and deterministic tests run successfully.",
    principles: ["Start with Mock", "Use fictional inputs", "Keep logs free of secrets", "Validate each added boundary"], workflow: ["Install", "Configure Mock", "Start", "Inspect", "Test"], visual: "deployment",
    sections: [
      { title: "Start the application", body: "Use the repository development command after installing dependencies and generating required clients. The terminal should show no missing-secret or schema errors." },
      { title: "Add one dependency at a time", body: "Introduce PostgreSQL, local models or server providers separately so failures remain attributable and recoverable." },
      { title: "Use the quality gates", body: "Before sharing a local change, run lint, unit tests, the relevant integration or E2E suite and a production build." },
    ], related: ["/docs/installation", "/docs/configuration", "/docs/testing"],
  },
  "demo-mode": {
    path: "/docs/demo-mode", eyebrow: "Docs · Demo Mode", title: "Evaluate the product without persistence or paid AI.", description: "Public demo execution mode, fictional data boundaries and zero-cost validation.",
    summary: "Demo mode is an explicit browser-only execution path. It uses an immutable fictional seed, per-tab memory and Mock AI, and resets on refresh.", principles: ["No Prisma initialization", "No database writes", "No paid provider key", "No browser persistence"], workflow: ["Fictional seed", "Per-tab store", "Finance engine", "Mock explanation", "Reset"], visual: "dashboard",
    sections: [{ title: "Separated by design", body: "Demo requests are routed into a client-only tree and do not silently fall through to self-host repositories." }, { title: "Not for real information", body: "The public demo has no authentication or durable privacy boundary and must contain fictional data only." }], related: ["/demo", "/security", "/docs/getting-started"], sourceFile: "docs/PUBLIC_DEMO.md",
  },
  postgresql: {
    path: "/docs/postgresql", eyebrow: "Docs · PostgreSQL", title: "Configure PostgreSQL without crossing the server boundary.", description: "Atlas AI PostgreSQL environment, Prisma baseline, testing and migration guidance.",
    summary: "Self-host repositories use pooled and direct PostgreSQL connections. The documented test-preview guards and migration process protect production data from automated validation.", principles: ["DATABASE_URL for runtime", "DIRECT_URL for migrations", "TLS required", "Guarded isolated test schemas"], workflow: ["Provider", "Credentials", "Baseline", "Generate", "Validate"], visual: "database",
    sections: [{ title: "Separate environments", body: "Preview and production databases require distinct credentials, ownership and operational policies." }, { title: "Never reuse archived migrations", body: "SQLite migration history is archival and cannot be deployed to PostgreSQL." }], related: ["/architecture/database", "/docs/testing", "/docs/self-hosting"], sourceFile: "docs/SELF_HOSTING.md",
  },
  "ai-providers": {
    path: "/docs/ai-providers", eyebrow: "Docs · AI Providers", title: "Choose a provider without changing financial truth.", description: "Provider modes, credentials, browser boundaries, structured validation and Mock fallback.",
    summary: "Mock, local, experimental browser and self-host providers expose different capabilities. The registry keeps those differences explicit and preserves one minimized context contract.", principles: ["Mock requires no key", "Local providers use loopback", "Cloud keys remain server-side", "Browser modes are gated"], workflow: ["Select", "Check capability", "Configure credential", "Test without finance context", "Explain"], visual: "coach",
    sections: [{ title: "Provider independence", body: "Switching adapters cannot change deterministic outputs or expand Coach Context." }, { title: "Fail closed", body: "Unsupported execution modes and unsafe endpoint combinations remain unavailable rather than silently degrading security." }], related: ["/architecture/ai-provider-registry", "/product/ai-coach", "/docs/security"], sourceFile: "docs/product/AI_ARCHITECTURE.md",
  },
  testing: {
    path: "/docs/testing", eyebrow: "Docs · Testing", title: "Validate deterministic behavior at every boundary.", description: "Unit, PostgreSQL integration, Playwright demo and security quality gates for Atlas AI.",
    summary: "Pure finance services receive dense unit coverage. Repository behavior uses guarded isolated PostgreSQL schemas, while demo and self-host browser suites validate their distinct execution modes.", principles: ["Unit tests for calculations", "Isolated PostgreSQL schemas", "Separate demo E2E", "Secret scan before merge"], workflow: ["Lint", "Unit", "Integration", "Build", "E2E"], visual: "repository",
    sections: [{ title: "Test the boundary you change", body: "Calculation changes require pure unit coverage; repository changes also require guarded integration validation." }, { title: "Protect production", body: "Automated tests accept only verified test-preview database endpoints and temporary schema prefixes." }], related: ["/architecture/finance-engine", "/contributing", "/docs/security"], sourceFile: "CONTRIBUTING.md",
  },
  faq: {
    path: "/docs/faq", eyebrow: "Docs · FAQ", title: "Clear answers about scope, data and AI.", description: "Frequently asked questions about Atlas AI product behavior, privacy, providers and deployment.",
    summary: "Atlas AI is an open-source financial intelligence workspace, not a bank, broker or financial adviser. Its deterministic engine calculates; optional AI providers explain already-structured results.",
    principles: ["Educational, not advisory", "Deterministic calculations", "Operator-controlled infrastructure", "Fictional public demo"], workflow: ["Ask", "Locate boundary", "Review evidence", "Choose mode", "Stay in control"], visual: "docs",
    sections: [
      { title: "Does AI calculate my finances?", body: "No. The finance engine calculates cash flow, risk, forecasts and payoff behavior. AI can only explain minimized structured outputs." },
      { title: "Does the public demo store data?", body: "No. Demo state is isolated to the current browser tab, uses fictional seed data and resets on reload. Real financial information must not be entered." },
      { title: "Can Atlas AI be self-hosted?", body: "Yes, for controlled environments. Public multi-user operation additionally requires authentication, authorization and owner-scoped data isolation." },
      { title: "Which providers are supported?", body: "Mock, local and configured server providers have distinct capabilities. Browser modes are experimental and explicitly gated." },
      { title: "Is this financial advice?", body: "No. Atlas AI provides educational calculations, scenarios and explanations. The final decision remains with the user." },
      { title: "Where should a security issue be reported?", body: "Use the private responsible-disclosure process described on the Security page. Never include credentials or personal financial data." },
    ], related: ["/security", "/docs/demo-mode", "/docs/ai-providers"],
  },
  "api-overview": {
    path: "/docs/api-overview", eyebrow: "Docs · API Overview", title: "A deliberately narrow server surface.", description: "An overview of Atlas AI route handlers, server actions and current API boundaries.",
    summary: "Atlas AI does not expose a broad public financial API. Server actions and narrow route handlers support the application while repositories, credentials and raw financial context remain behind server boundaries.",
    principles: ["No client-side Prisma", "Validated server inputs", "Minimal responses", "No client-supplied provider secrets"], workflow: ["Client intent", "Input validation", "Server service", "Repository or provider", "Safe response"], visual: "repository",
    sections: [
      { title: "Application actions", body: "Income, expenses, debts, memory and reminders use validated server-side workflows rather than exposing raw persistence operations." },
      { title: "Coach boundary", body: "The coach route accepts controlled application intent and never accepts browser credentials or arbitrary raw financial context." },
      { title: "Rate refresh boundary", body: "Rate refresh runs server-side and returns limited application-safe status without exposing upstream credentials or raw errors." },
      { title: "No stability promise yet", body: "The current route surface supports the application and is not published as a versioned third-party API contract." },
    ], related: ["/architecture/repository", "/docs/security", "/docs/testing"], sourceFile: "docs/ARCHITECTURE.md",
  },
  security: {
    path: "/docs/security", eyebrow: "Docs · Security", title: "Protect data, credentials and execution boundaries.", description: "Security guidance for financial data, provider keys, demo mode and responsible disclosure.",
    summary: "Atlas AI treats financial records and infrastructure credentials as sensitive. Security controls focus on minimization, server-side secrets, explicit execution modes and safe reporting.", principles: ["No secrets in client bundles", "No real data in fixtures", "Minimized AI context", "Private vulnerability reporting"], workflow: ["Identify boundary", "Minimize data", "Validate access", "Scan", "Review"], visual: "repository",
    sections: [{ title: "Credential boundaries", body: "Cloud provider and PostgreSQL credentials remain in server-side environment stores. Browser exceptions are explicit, transient and disabled by default." }, { title: "Responsible disclosure", body: "Suspected vulnerabilities should be reported privately without credentials, personal data or live exploit payloads." }], related: ["/security", "/docs/ai-providers", "/architecture/self-hosting"], sourceFile: "SECURITY.md",
  },
  "self-hosting": {
    path: "/docs/self-hosting", eyebrow: "Docs · Self-hosting", title: "Deploy Atlas AI in a controlled environment.", description: "Installation, PostgreSQL, provider configuration and current production limitations.",
    summary: "Self-host mode supports single-user development and controlled environments. The operator supplies infrastructure and must add authentication and ownership controls before public multi-user use.", principles: ["Node.js 20+", "PostgreSQL", "Optional AI provider", "Operator-managed security"], workflow: ["Install", "Configure", "Generate", "Test", "Operate"], visual: "deployment",
    sections: [{ title: "Start with Mock", body: "Deterministic functionality does not require a paid model and can be validated before provider credentials are configured." }, { title: "Review production readiness", body: "Authentication, authorization, backups, migration drills and monitoring are required before accepting real public data." }], related: ["/architecture/self-hosting", "/docs/postgresql", "/security"], sourceFile: "docs/SELF_HOSTING.md",
  },
};

export const resourcePages: Record<string, PublicPageContent> = {
  security: {
    path: "/security", eyebrow: "Open Source · Security", title: "Security is a product boundary, not a badge.", description: "Atlas AI security policy, credential rules, demo limitations and responsible disclosure.",
    summary: "Atlas AI separates financial data, browser credentials, server providers and public demo state into explicit threat boundaries. The repository policy below remains the source of truth for disclosure and operational safety.",
    principles: ["No hidden AI memory", "Operator-owned data", "Transient browser credentials", "Isolated fictional demo"], workflow: ["Report privately", "Acknowledge safely", "Validate scope", "Remediate", "Coordinate disclosure"], visual: "security",
    sections: [
      { title: "Data ownership", body: "Self-host data remains inside the operator's PostgreSQL and server boundary. The project does not require a vendor-owned financial database." },
      { title: "No hidden AI memory", body: "Financial Memory stores structured deterministic snapshots. AI providers receive minimized context and do not become the system of record." },
      { title: "Browser credentials", body: "Experimental browser keys are temporary, never persisted and cleared by reload or disconnect. Server provider credentials never enter client bundles." },
      { title: "Provider boundaries", body: "Provider adapters cannot change financial calculations and must return validated structured explanations or a controlled fallback." },
      { title: "Demo isolation", body: "The public demo uses fictional data, per-tab state, Mock AI and no database access. It is not a place for real financial information." },
      { title: "Responsible disclosure", body: "Report suspected vulnerabilities privately with reproducible, minimized evidence. Never include secrets, personal data or destructive live payloads." },
    ], related: ["/docs/security", "/architecture", "/contributing"], sourceFile: "SECURITY.md",
  },
  contributing: {
    path: "/contributing", eyebrow: "Open Source · Contributing", title: "Contribute without weakening the product constitution.", description: "Development setup, quality gates, code style and pull request guidance for Atlas AI contributors.",
    summary: "Atlas AI welcomes small, evidence-backed changes that preserve deterministic finance, privacy boundaries and reviewability. The repository contribution guide below remains authoritative.",
    principles: ["Small reviewable changes", "Deterministic finance", "Fictional test data", "Tests proportional to risk"], workflow: ["Read philosophy", "Open or choose an issue", "Create a focused branch", "Validate locally", "Open a reviewable PR"], visual: "docs",
    sections: [
      { title: "Project philosophy", body: "Financial calculations remain deterministic, AI stays explanatory and the user retains decision authority." },
      { title: "Repository structure", body: "Finance, rates, coach, persistence and presentation concerns remain separated. New work should follow the established module boundary." },
      { title: "Coding standards", body: "Use strict TypeScript, server components by default, semantic HTML and existing shared primitives. Avoid unrelated cleanup and unnecessary dependencies." },
      { title: "Issues and pull requests", body: "Describe the user problem, scope, acceptance criteria and validation evidence. Keep pull requests focused enough to review and revert safely." },
      { title: "Branch naming", body: "Use descriptive feature or fix branches from the active integration branch and avoid mixing release work with unrelated changes." },
      { title: "Testing and community", body: "Run the relevant quality gates, use fictional data and follow the Code of Conduct in every technical discussion." },
    ], related: ["/docs/getting-started", "/roadmap", "/security"], sourceFile: "CONTRIBUTING.md",
  },
  roadmap: {
    path: "/roadmap", eyebrow: "Open Source · Roadmap", title: "A transparent roadmap with explicit status.", description: "Implemented, in-progress, planned and long-range Atlas AI product directions.",
    summary: "The roadmap separates evidence-backed delivery from active refinement and future direction. Status is intentionally date-free and does not promise delivery windows.",
    principles: ["Completed", "In Progress", "Planned", "Future Vision"], workflow: ["Review evidence", "Assign status", "State constraints", "Validate direction", "Update openly"], visual: "roadmap",
    sections: [
      { title: "Completed", body: "Deterministic finance planning, forecasts, reversible decision scenarios, structured financial memory, reminders, provider registry boundaries and a database-free public demo." },
      { title: "In Progress", body: "Product polish, public documentation, responsive quality, accessibility, open-source release readiness and clearer operational guidance." },
      { title: "Planned", body: "Stronger reporting, evaluated coaching quality, improved self-host operations and carefully scoped ownership controls." },
      { title: "Future Vision", body: "A transparent financial intelligence layer that remains portable across infrastructure and providers without surrendering deterministic truth." },
    ], related: ["/product", "/contributing", "/architecture"], sourceFile: "docs/ROADMAP.md",
  },
  license: {
    path: "/license", eyebrow: "Open Source · License", title: "MIT licensed. Open to inspect, adapt and share.", description: "Atlas AI commercial use, modification, distribution, private use and warranty terms.",
    summary: "The MIT License permits broad use while requiring preservation of the copyright and permission notice. The complete repository license below is the legal source of truth.",
    principles: ["Commercial use", "Modification", "Distribution", "Private use"], workflow: ["Read the license", "Retain the notice", "Adapt responsibly", "Distribute", "Accept the warranty disclaimer"], visual: "docs",
    sections: [
      { title: "Commercial usage", body: "The MIT License permits use of the software in commercial products and services, subject to retaining the required notice." },
      { title: "Modification", body: "You may inspect, change and create derivative work while preserving the license and copyright notice." },
      { title: "Distribution", body: "Source or modified copies may be distributed with the required notice included." },
      { title: "Private use", body: "The software may be used and modified inside private environments." },
      { title: "Warranty disclaimer", body: "The software is provided as-is, without warranty. Review the complete license text for the authoritative terms." },
    ], related: ["/contributing", "/security", "/roadmap"], sourceFile: "LICENSE",
  },
  github: {
    path: "/github", eyebrow: "Open Source · GitHub", title: "Build in the open. Review the evidence.", description: "Atlas AI repository, issues, discussions, releases, contribution model and versioning philosophy.",
    summary: "The GitHub repository is the operational home for source code, issue history, releases and community contributions. Public product claims should remain traceable to code, tests or documented status.",
    principles: ["Source and history", "Issues and discussions", "Reviewed contributions", "Versioned releases"], workflow: ["Explore", "Search issues", "Discuss", "Contribute", "Follow releases"], visual: "github",
    sections: [
      { title: "Repository", body: "Inspect the application, deterministic finance services, provider boundaries, public demo and documentation in one open repository." },
      { title: "Issues", body: "Use issues for reproducible bugs, scoped product proposals and documentation gaps. Search existing reports before opening a new one." },
      { title: "Discussions", body: "Use repository community channels for architecture questions and product direction when available; never disclose security issues publicly." },
      { title: "Releases", body: "Release notes and tags communicate validated milestones. Planned work remains distinct from shipped capability." },
      { title: "Stars and contribution", body: "Stars help discovery; code, testing, documentation and careful review improve the product directly." },
      { title: "Versioning philosophy", body: "Versions follow validated product milestones and should not imply production readiness beyond the documented operational boundary." },
    ],
    links: [
      { title: "Open Repository", description: "Inspect source code, branches and project history.", href: "https://github.com/Tngc93/personal-finance-coach-dashboard" },
      { title: "Browse Issues", description: "Review known bugs and scoped improvement proposals.", href: "https://github.com/Tngc93/personal-finance-coach-dashboard/issues" },
      { title: "View Releases", description: "Follow versioned, validated repository milestones.", href: "https://github.com/Tngc93/personal-finance-coach-dashboard/releases" },
    ], related: ["/contributing", "/roadmap", "/security"],
  },
};

export function findPublicPage(path: string) {
  return [productPages, architecturePages, docsPages, resourcePages].flatMap((collection) => Object.values(collection)).find((page) => page.path === path);
}
