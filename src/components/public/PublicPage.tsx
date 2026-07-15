import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowRight, BellRing, Bot, BrainCircuit, Check, CircleCheck, Clock3, CodeXml, Compass, Database, FileText, Gauge, GitFork, HardDrive, KeyRound, LineChart, MemoryStick, Route, ServerCog, ShieldCheck } from "lucide-react";
import { ArchitectureExplorer, DecisionSimulatorStory } from "@/components/landing/LandingInteractions";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { PublicFooter, PublicHeader } from "@/components/public/PublicChrome";
import { findPublicPage, type PublicPageContent } from "@/lib/public-site/content";

const iconSet = [Gauge, LineChart, BrainCircuit, MemoryStick, BellRing, Bot] as const;

const productWorkflowCards = [
  { index: "01", title: "Dashboard", href: "/product/dashboard" },
  { index: "02", title: "Forecast Engine", href: "/product/forecast" },
  { index: "03", title: "Decision Simulator", href: "/product/decision-simulator" },
  { index: "04", title: "Financial Memory", href: "/product/financial-memory" },
  { index: "05", title: "Reminder Engine", href: "/product/reminders" },
  { index: "06", title: "AI Coach", href: "/product/ai-coach" },
] as const;

export function PublicPage({ content }: { content: PublicPageContent }) {
  const crumbs = content.path.split("/").filter(Boolean);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": content.path.startsWith("/docs") ? "TechArticle" : "WebPage",
    name: content.title,
    description: content.description,
    url: content.path,
    isPartOf: { "@type": "WebSite", name: "Atlas AI", url: "/" },
  };
  return (
    <div lang="en" className="landing-root public-site overflow-x-clip text-white">
      <a className="landing-skip" href="#public-content">Skip to main content</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <LandingMotion />
      <PublicHeader />
      <main id="public-content" className="public-site-main">
      <section className="public-hero" aria-labelledby="public-title">
        <nav className="public-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link>{crumbs.map((crumb, index) => {
          const href = `/${crumbs.slice(0, index + 1).join("/")}`;
          const label = crumb.replaceAll("-", " ");
          return <span key={href}><ArrowRight aria-hidden /><Link href={href} aria-current={index === crumbs.length - 1 ? "page" : undefined}>{label}</Link></span>;
        })}</nav>
        <p className="public-eyebrow">{content.eyebrow}</p>
        <h1 id="public-title">{content.title}</h1>
        <p className="public-summary">{content.summary}</p>
        <div className="public-hero-actions"><Link href="/demo" className="landing-button landing-button-primary atlas-glass-strong">Try the Live Demo <ArrowRight aria-hidden /></Link><Link href="/docs" className="landing-button landing-button-secondary atlas-glass">Read the Docs</Link></div>
      </section>

      <section className="public-section public-principles" aria-labelledby="principles-title" data-landing-reveal>
        <div className="public-section-heading"><p>Core principles</p><h2 id="principles-title">What this layer protects.</h2></div>
        <div className="public-card-grid">{content.principles.map((principle, index) => { const Icon = iconSet[index % iconSet.length]; return <article className="atlas-glass public-card" key={principle}><span>0{index + 1}</span><Icon aria-hidden /><h3>{principle}</h3><p>Designed as an explicit, testable part of the Atlas AI product boundary.</p></article>; })}</div>
      </section>

      <section className="public-section public-visual-section" aria-labelledby="visual-title" data-landing-reveal>
        <div className="public-section-heading"><p>System view</p><h2 id="visual-title">How the experience fits together.</h2></div>
        <PublicVisual content={content} />
      </section>

      {content.links?.length ? <PublicDirectory links={content.links} /> : null}

      {content.sections.length > 0 ? <section className="public-section" aria-labelledby="details-title" data-landing-reveal>
        <div className="public-section-heading"><p>In depth</p><h2 id="details-title">Built around clear responsibilities.</h2></div>
        <div className="public-detail-grid">{content.sections.map((section, index) => <article className="atlas-glass" key={section.title}><span>0{index + 1}</span><h3>{section.title}</h3><p>{section.body}</p></article>)}</div>
      </section> : null}

      {content.sourceFile ? <MarkdownSource sourceFile={content.sourceFile} /> : null}

      <section className="public-section public-workflow" aria-labelledby="workflow-title" data-landing-reveal>
        <div className="public-section-heading"><p>Workflow</p><h2 id="workflow-title">A visible path from input to review.</h2></div>
        {content.path === "/product" ? <ProductWorkflowGrid /> : <ol>{content.workflow.map((step, index) => <li className="atlas-glass" key={step}><span>0{index + 1}</span><strong>{step}</strong>{index < content.workflow.length - 1 ? <ArrowRight aria-hidden /> : <Check aria-hidden />}</li>)}</ol>}
      </section>

      <RelatedPages paths={content.related} />
      <PublicCta content={content} />
      </main>
      <PublicFooter />
    </div>
  );
}

function ProductWorkflowGrid() {
  return (
    <ol className="product-workflow-grid">
      {productWorkflowCards.map((card) => (
        <li key={card.href}>
          <Link className="product-workflow-card atlas-glass" href={card.href} aria-label={`Explore ${card.title}`}>
            <span className="product-workflow-index">{card.index}</span>
            <strong>{card.title}</strong>
            <ArrowRight aria-hidden />
          </Link>
        </li>
      ))}
    </ol>
  );
}

function PublicVisual({ content }: { content: PublicPageContent }) {
  if (content.visual === "architecture") return <ArchitectureExplorer />;
  if (content.visual === "decision") return <DecisionSimulatorStory />;
  if (content.visual === "forecast") return <div className="public-product-visual atlas-glass-strong"><div className="public-visual-top"><span>24-month projection</span><strong>Fictional data</strong></div><div className="public-chart" aria-label="Fictional 24-month forecast chart"><i style={{ height: "24%" }} /><i style={{ height: "34%" }} /><i style={{ height: "42%" }} /><i style={{ height: "55%" }} /><i style={{ height: "62%" }} /><i style={{ height: "78%" }} /><i style={{ height: "88%" }} /></div><div className="public-visual-legend"><span>Current plan</span><span>Risk: Low</span><span>Month 24</span></div></div>;
  if (content.visual === "timeline") return <div className="public-timeline-visual atlas-glass-strong">{["April", "May", "June", "July"].map((month, index) => <article key={month}><span>0{index + 1}</span><strong>{month}</strong><p>Safe budget trend</p><small>{index < 2 ? "Risk: Medium" : "Risk: Low"}</small></article>)}</div>;
  if (content.visual === "reminders") return <div className="public-reminder-visual atlas-glass-strong">{[["Minimum payment review", "Due in 5 days"], ["Monthly snapshot", "Ready to review"], ["Rate data", "Current"]].map(([title, status], index) => <article key={title}><BellRing aria-hidden /><div><span>0{index + 1}</span><strong>{title}</strong><p>{status}</p></div></article>)}</div>;
  if (content.visual === "coach") return <div className="public-coach-visual atlas-glass-strong"><div><LineChart aria-hidden /><span>Deterministic output</span><strong>Safe budget protected</strong><p>Calculated by the Finance Engine.</p></div><ArrowRight aria-hidden /><div><Bot aria-hidden /><span>Optional explanation</span><strong>Why this result changed</strong><p>Validated, provider-independent language.</p></div></div>;
  if (content.visual === "database" || content.visual === "repository" || content.visual === "deployment") return <div className="public-layer-visual atlas-glass-strong">{(content.visual === "database" ? [[HardDrive, "Repository"], [Database, "PostgreSQL"], [ShieldCheck, "Operator boundary"]] : content.visual === "deployment" ? [[FileText, "Environment"], [ServerCog, "Atlas AI"], [Database, "PostgreSQL"]] : [[BrainCircuit, "Domain service"], [HardDrive, "Repository contract"], [Database, "Storage adapter"]]).map(([Icon, label], index) => <div key={String(label)}><Icon aria-hidden /><span>0{index + 1}</span><strong>{String(label)}</strong></div>)}</div>;
  if (content.visual === "docs") return <div className="public-doc-visual atlas-glass-strong">{["Getting Started", "Architecture", "Product", "Open Source", "Resources"].map((item, index) => <div key={item}><FileText aria-hidden /><span>0{index + 1}</span><strong>{item}</strong></div>)}</div>;
  if (content.visual === "security") return <div className="public-boundary-visual atlas-glass-strong" aria-label="Atlas AI security boundaries">{[[KeyRound, "Temporary browser credential", "Session-only and explicitly gated"], [Database, "Operator-owned data", "Stored behind repository boundaries"], [ShieldCheck, "Validated provider output", "Explanation cannot replace calculation"]].map(([Icon, title, description], index) => <article key={String(title)}><Icon aria-hidden /><span>0{index + 1}</span><strong>{String(title)}</strong><p>{String(description)}</p></article>)}</div>;
  if (content.visual === "roadmap") return <div className="public-roadmap-visual atlas-glass-strong" aria-label="Atlas AI public roadmap status">{[[CircleCheck, "Completed", "Evidence-backed capability"], [Clock3, "In Progress", "Active refinement"], [Route, "Planned", "Scoped direction"], [Compass, "Future Vision", "Long-range intent"]].map(([Icon, title, description], index) => <article key={String(title)}><Icon aria-hidden /><span>0{index + 1}</span><strong>{String(title)}</strong><p>{String(description)}</p></article>)}</div>;
  if (content.visual === "github") return <div className="public-github-visual atlas-glass-strong"><div><GitFork aria-hidden /><span>github.com / Tngc93</span><strong>personal-finance-coach-dashboard</strong><p>Open source · MIT License · Deterministic finance</p></div><div className="public-github-stats"><article><CodeXml aria-hidden /><strong>Source</strong><span>Inspect every boundary</span></article><article><Route aria-hidden /><strong>Issues</strong><span>Trace scoped work</span></article><article><FileText aria-hidden /><strong>Releases</strong><span>Follow validated milestones</span></article></div></div>;
  return <div className="public-dashboard-visual atlas-glass-strong"><aside><span>A</span><strong>Atlas AI</strong>{["Overview", "Forecasts", "Decisions", "Memory"].map(item => <p key={item}>{item}</p>)}</aside><div><div className="public-kpis"><article><span>Safe budget</span><strong>₺18,420</strong></article><article><span>Risk level</span><strong>Medium</strong></article><article><span>Debt reduction</span><strong>₺6,800</strong></article></div><div className="public-dashboard-chart"><LineChart aria-hidden /><strong>30-day forecast</strong><p>Fictional product preview</p></div></div></div>;
}

function PublicDirectory({ links }: { links: NonNullable<PublicPageContent["links"]> }) {
  return (
    <section className="public-section public-directory" aria-labelledby="directory-title" data-landing-reveal>
      <div className="public-section-heading"><p>Explore</p><h2 id="directory-title">Find the next useful path.</h2></div>
      <div>
        {links.map((item) => item.href.startsWith("http") ? (
          <a className="atlas-glass" href={item.href} target="_blank" rel="noreferrer" key={item.href}><FileText aria-hidden /><span><strong>{item.title}</strong><small>{item.description}</small></span><ArrowRight aria-hidden /></a>
        ) : (
          <Link className="atlas-glass" href={item.href} key={item.href}><FileText aria-hidden /><span><strong>{item.title}</strong><small>{item.description}</small></span><ArrowRight aria-hidden /></Link>
        ))}
      </div>
    </section>
  );
}

function PublicCta({ content }: { content: PublicPageContent }) {
  const github = content.path === "/github";
  return (
    <section className="public-cta atlas-glass-strong" data-landing-reveal>
      <ShieldCheck aria-hidden />
      <h2>{github ? "Review Atlas AI in the open." : "Keep financial reasoning transparent."}</h2>
      <p>{github ? "Inspect the repository, follow validated releases or contribute a focused improvement." : "Explore Atlas AI with fictional data or review the architecture before running it in your own environment."}</p>
      <div>
        {github ? <a href="https://github.com/Tngc93/personal-finance-coach-dashboard" target="_blank" rel="noreferrer" className="landing-button landing-button-primary atlas-glass-strong">Open Repository <ArrowRight aria-hidden /></a> : <Link href="/demo" className="landing-button landing-button-primary atlas-glass-strong">Try the Live Demo</Link>}
        <Link href={github ? "/contributing" : "/architecture"} className="landing-button landing-button-secondary atlas-glass">{github ? "Contributing Guide" : "Explore Architecture"}</Link>
      </div>
    </section>
  );
}

function RelatedPages({ paths }: { paths: readonly string[] }) {
  const related = paths.map(findPublicPage).filter((page): page is PublicPageContent => Boolean(page));
  return <section className="public-section public-related" aria-labelledby="related-title" data-landing-reveal><div className="public-section-heading"><p>Continue exploring</p><h2 id="related-title">Go deeper into Atlas AI.</h2></div><div>{related.map(page => <Link className="atlas-glass" href={page.path} key={page.path}><span>{page.eyebrow}</span><strong>{page.title}</strong><p>{page.description}</p><ArrowRight aria-hidden /></Link>)}</div></section>;
}

function MarkdownSource({ sourceFile }: { sourceFile: string }) {
  const absolutePath = path.join(process.cwd(), sourceFile);
  const markdown = fs.readFileSync(absolutePath, "utf8");
  const blocks = parseMarkdown(markdown);
  return <section className="public-section public-document" aria-labelledby="source-title" data-landing-reveal><div className="public-section-heading"><p>Repository source</p><h2 id="source-title">Documentation that stays aligned with the code.</h2></div><article className="atlas-glass-strong public-markdown">{blocks}</article></section>;
}

function parseMarkdown(markdown: string) {
  const lines = markdown.split("\n");
  const nodes: React.ReactNode[] = [];
  let list: string[] = [];
  let code: string[] = [];
  let inCode = false;
  const flushList = () => { if (list.length) { nodes.push(<ul key={`list-${nodes.length}`}>{list.map(item => <li key={item}>{item}</li>)}</ul>); list = []; } };
  const flushCode = () => { if (code.length) { nodes.push(<pre key={`code-${nodes.length}`}><code>{code.join("\n")}</code></pre>); code = []; } };
  lines.forEach((line) => {
    if (line.startsWith("```")) { if (inCode) flushCode(); else flushList(); inCode = !inCode; return; }
    if (inCode) { code.push(line); return; }
    if (line.startsWith("# ")) { flushList(); nodes.push(<h2 key={`h1-${nodes.length}`}>{line.slice(2)}</h2>); return; }
    if (line.startsWith("## ")) { flushList(); nodes.push(<h3 key={`h2-${nodes.length}`}>{line.slice(3)}</h3>); return; }
    if (line.startsWith("### ")) { flushList(); nodes.push(<h4 key={`h3-${nodes.length}`}>{line.slice(4)}</h4>); return; }
    if (line.startsWith("- ")) { list.push(line.slice(2).replaceAll("**", "")); return; }
    if (line.startsWith("|") && !line.includes("---")) { flushList(); nodes.push(<p className="public-markdown-row" key={`row-${nodes.length}`}>{line.split("|").map(value => value.trim()).filter(Boolean).join(" · ")}</p>); return; }
    if (line.startsWith(">")) { flushList(); nodes.push(<p key={`quote-${nodes.length}`}>{line.replace(/^>\s?/, "").replaceAll("**", "")}</p>); return; }
    if (!line.trim() || line.startsWith("[!")) { flushList(); return; }
    flushList(); nodes.push(<p key={`p-${nodes.length}`}>{line.replaceAll("**", "").replaceAll("`", "")}</p>);
  });
  flushList(); flushCode();
  return nodes;
}
