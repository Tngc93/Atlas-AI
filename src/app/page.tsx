import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { ArchitectureExplorer, DecisionSimulatorStory } from "@/components/landing/LandingInteractions";
import { PublicFooter, PublicHeader } from "@/components/public/PublicChrome";
import {
  ArrowDown,
  ArrowRight,
  BookOpenText,
  Bot,
  BrainCircuit,
  Check,
  Cloud,
  Code2,
  CodeXml,
  Database,
  LineChart,
  LockKeyhole,
  MemoryStick,
  Network,
  Play,
  Route,
  Server,
  ShieldCheck,
  Sparkles,
  GitPullRequestArrow,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Atlas AI — Open-source AI Financial Intelligence Platform",
  description: "A deterministic finance engine, provider-independent AI layer and self-hostable open-source architecture for explainable financial decisions.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Atlas AI — Open-source AI Financial Intelligence Platform",
    description: "Bring your own AI. Bring your own Database. Deploy anywhere.",
    type: "website",
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas AI — Open-source AI Financial Intelligence Platform",
    description: "Bring your own AI. Bring your own Database. Deploy anywhere.",
  },
};

const features = [
  ["Deterministic Finance Engine", "Verifiable calculations remain the source of financial truth.", LineChart],
  ["Forecast Engine", "Project visible assumptions, milestones and risk over time.", Sparkles],
  ["Decision Simulator", "Compare outcomes without changing stored financial data.", BrainCircuit],
  ["Financial Memory", "Preserve deterministic monthly snapshots and trend context.", MemoryStick],
  ["Reminder Engine", "Surface critical dates and financial thresholds deterministically.", ShieldCheck],
  ["AI Coach", "Explain calculated outcomes in clear, educational language.", Bot],
  ["Bring Your Own AI", "Keep model selection and credentials under your control.", Network],
  ["Bring Your Own Database", "Run financial data on your PostgreSQL infrastructure.", Database],
  ["Self-hosted", "Deploy inside your own network and security boundary.", Server],
  ["Open Source", "Inspect, adapt and contribute under the MIT License.", Code2],
] as const;

const stack = [
  { label: "YOUR AI", icon: Bot, items: ["Mock · Implemented", "Ollama · Implemented", "LM Studio · Implemented", "Gemini browser · Experimental", "OpenRouter browser · Experimental", "OpenAI / Anthropic / Custom · Self-host only"] },
  { label: "YOUR DATABASE", icon: Database, items: ["PostgreSQL · Implemented", "Neon · PostgreSQL compatible", "Supabase · PostgreSQL compatible", "Demo Store · Implemented"] },
  { label: "YOUR DEPLOYMENT", icon: Cloud, items: ["Vercel · Demo preview", "Self-host · Supported", "Docker · Planned", "Your cloud · Self-host"] },
] as const;

const capabilities = [
  ["Deterministic Finance Engine", "Verifiable financial calculations.", LineChart],
  ["Forecast Engine", "Visible assumptions across 24 months.", Sparkles],
  ["Decision Simulator", "Compare before you commit.", BrainCircuit],
  ["Financial Memory", "Monthly snapshots and trend context.", MemoryStick],
  ["AI Provider Independent", "Model choice stays under your control.", Network],
] as const;

const resources = [
  { title: "GitHub", description: "Source code, issues and releases.", icon: CodeXml, href: "https://github.com/Tngc93/personal-finance-coach-dashboard", external: true },
  { title: "Documentation", description: "Architecture and self-hosting guides.", icon: BookOpenText, href: "/docs" },
  { title: "Security", description: "Privacy boundaries and disclosure policy.", icon: ShieldCheck, href: "/security" },
  { title: "Contributing", description: "How to improve Atlas AI with the community.", icon: GitPullRequestArrow, href: "/contributing" },
  { title: "Roadmap", description: "The product direction and planned milestones.", icon: Route, href: "/roadmap" },
  { title: "MIT License", description: "Use, inspect and adapt the open-source code.", icon: LockKeyhole, href: "/license" },
] as const;

const demoSafety = [
  ["Synthetic Data", "Fictional inputs only.", Database],
  ["Session Isolated", "A private per-tab session.", ShieldCheck],
  ["No Persistence", "Nothing is written to storage.", LockKeyhole],
  ["Mock AI", "No paid provider is called.", Bot],
] as const;

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Atlas AI",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    license: "https://opensource.org/license/mit",
    description: "Open-source AI financial intelligence platform.",
  };

  return (
    <main lang="en" className="landing-root overflow-x-clip text-white">
      <a className="landing-skip" href="#main-content">Skip to main content</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <LandingMotion />
      <PublicHeader landing />

      <section className="landing-hero" aria-labelledby="hero-title">
        <div id="main-content" className="landing-hero-content">
          <p className="hero-reveal hero-step-2 landing-mark">Atlas AI</p>
          <h1 id="hero-title" className="landing-title">
            <span className="hero-line"><span className="hero-reveal hero-step-3">Turn financial data</span></span>
            <span className="hero-line"><span className="hero-reveal hero-step-3b">into decisions</span></span>
            <span className="hero-line"><span className="hero-reveal hero-step-3c">you can explain.</span></span>
          </h1>
          <p className="hero-reveal hero-step-4 landing-lead">A deterministic finance engine, provider-independent AI layer and self-hostable open-source architecture — designed to keep financial reasoning transparent and under your control.</p>
          <p className="hero-reveal hero-step-4 landing-tagline">Bring your own AI.<br />Bring your own database.<br />Deploy anywhere.</p>
          <div className="hero-reveal hero-step-5 landing-actions">
            <a href="#features" className="landing-button landing-button-primary atlas-glass-strong">Explore Atlas AI <ArrowDown size={18} /></a>
            <Link href="/demo" className="landing-button landing-button-secondary atlas-glass">Try the Live Demo <Play size={17} fill="currentColor" /></Link>
          </div>
          <div className="hero-reveal hero-step-6 landing-proof" aria-label="License and deployment attributes">
            <span>MIT Licensed</span><span>Open Source</span><span>Self-host Ready</span><span>No Vendor Lock-in</span>
          </div>
        </div>
        <a href="#features" className="hero-reveal hero-step-7 landing-scroll" aria-label="Scroll to product capabilities"><span>SCROLL</span><ArrowDown size={16} /></a>
      </section>

      <section className="capability-strip atlas-glass" aria-label="Core Atlas AI capabilities" data-landing-reveal>
        {capabilities.map(([title, description, Icon], index) => <div key={title}><span>0{index + 1}</span><Icon aria-hidden /><strong>{title}</strong><p>{description}</p></div>)}
      </section>

      <section id="features" className="landing-section landing-features cv-auto" aria-labelledby="features-title" data-landing-reveal>
        <div className="landing-section-heading"><p>01 — PLATFORM</p><h2 id="features-title">An open system<br />for financial decisions.</h2></div>
        <div className="feature-grid">{features.map(([title, text, Icon], index) => (
          <article className="feature-card atlas-glass" key={title}><span>0{index + 1}</span><Icon aria-hidden /><h3>{title}</h3><p>{text}</p></article>
        ))}</div>
      </section>

      <section className="truth-section cv-auto" aria-labelledby="truth-title" data-landing-reveal>
        <div><p>ATLAS PRINCIPLE</p><h2 id="truth-title">AI explains.<br /><em>Finance decides.</em></h2></div>
        <div className="truth-copy"><p>Atlas AI does not ask a language model to calculate your financial reality.</p><p>The deterministic finance engine produces the numbers, risks and scenarios. AI is an optional explanation layer.</p><p className="truth-accent">Explainable by design.<br />Deterministic at the core.</p></div>
      </section>

      <section className="landing-section preview-section cv-auto" aria-labelledby="preview-title" data-landing-reveal>
        <div className="landing-section-heading"><p>02 — PRODUCT OVERVIEW</p><h2 id="preview-title">See the financial picture<br />at a glance.</h2></div>
        <DashboardPreview />
      </section>

      <section className="landing-section product-story forecast-story cv-auto" aria-labelledby="forecast-story-title" data-landing-reveal>
        <div className="story-copy"><p>03 — FORECAST EXPERIENCE</p><h2 id="forecast-story-title">See beyond today.<br />Plan the next 24 months.</h2><p>Explore visible assumptions, debt payoff milestones, safe-budget trends and risk scenarios through deterministic projections.</p></div>
        <div className="forecast-showcase atlas-surface-3"><div className="period-selector" aria-label="Forecast period"><span>3 mo</span><span>6 mo</span><span>12 mo</span><span className="active">24 mo</span></div><div className="forecast-value"><span>Projected net position</span><strong>₺42,800</strong><small>at month 24</small></div><svg viewBox="0 0 900 330" role="img" aria-label="24-month net position and risk trend"><path className="forecast-grid" d="M0 65H900M0 130H900M0 195H900M0 260H900"/><path className="story-chart-area" d="M0 280 C100 260 130 220 220 235 S350 170 440 190 S590 115 690 128 S810 70 900 42 L900 330H0Z"/><path className="story-chart-line" d="M0 280 C100 260 130 220 220 235 S350 170 440 190 S590 115 690 128 S810 70 900 42"/><g className="milestones"><circle cx="220" cy="235" r="6"/><circle cx="440" cy="190" r="6"/><circle cx="690" cy="128" r="6"/><circle cx="900" cy="42" r="6"/></g></svg><div className="milestone-labels"><span>First debt payoff</span><span>Risk: Low</span><span>Safe budget strengthening</span></div></div>
      </section>

      <section className="landing-section product-story simulator-story cv-auto" aria-labelledby="simulator-title" data-landing-reveal>
        <div className="story-copy"><p>04 — DECISION SIMULATOR</p><h2 id="simulator-title">See the outcome<br />before making the decision.</h2><p>Compare hypothetical scenarios without changing stored financial data.</p></div><DecisionSimulatorStory />
      </section>

      <section className="landing-section product-story memory-story cv-auto" aria-labelledby="memory-story-title" data-landing-reveal>
        <div className="story-copy"><p>05 — FINANCIAL MEMORY</p><h2 id="memory-story-title">Preserve financial context<br />over time.</h2><p>Monthly snapshots reveal changes in debt, risk, mandatory expenses, safe budget and financial behavior.</p></div><div className="memory-showcase atlas-surface-3"><div className="memory-axis" aria-hidden></div>{[["April","Medium","₺9,200"],["May","Medium","₺11,450"],["June","Low","₺14,800"],["July","Low","₺18,420"]].map(([month,risk,budget],index)=><article className="memory-point atlas-surface-1" key={month}><span>0{index+1}</span><strong>{month}</strong><p>Safe budget {budget}</p><small>Risk: {risk}</small></article>)}</div>
      </section>

      <section className="demo-band cv-auto" aria-labelledby="demo-title" data-landing-reveal>
        <div><p>PUBLIC DEMO</p><h2 id="demo-title">Explore safely.<br />Leave nothing behind.</h2></div>
        <div className="demo-copy"><p>The public demo uses synthetic data, creates no persistent records and never consumes a platform-owned AI key.</p><p>Do not enter real financial information. The demo exists only to introduce the product within safe boundaries.</p><div className="safety-timeline">{demoSafety.map(([item, description, Icon], index) => <div className="atlas-glass" key={item}><span>0{index + 1}</span><Icon aria-hidden /><strong>{item}</strong><p>{description}</p></div>)}</div><Link href="/demo" className="landing-button landing-button-primary atlas-glass-strong">Open the Demo <ArrowRight size={20} /></Link></div>
      </section>

      <section className="landing-section stack-section cv-auto" aria-labelledby="stack-title" data-landing-reveal>
        <div className="landing-section-heading"><p>06 — BRING YOUR OWN STACK</p><h2 id="stack-title">Your infrastructure.<br />Your choice.</h2></div>
        <div className="stack-grid">{stack.map(({ label, icon: Icon, items }) => <article key={label} className="stack-column"><Icon aria-hidden /><p>{label}</p><ul>{items.map(item => <li key={item}><Check size={14} aria-hidden />{item}</li>)}</ul></article>)}</div>
      </section>

      <section id="architecture" className="landing-section architecture-section cv-auto" aria-labelledby="architecture-title" data-landing-reveal>
        <div className="landing-section-heading"><p>07 — ARCHITECTURE</p><h2 id="architecture-title">Clear boundaries.<br />Replaceable layers.</h2></div>
        <ArchitectureExplorer />
      </section>

      <section id="open-source" className="open-source-section cv-auto" aria-labelledby="open-source-title" data-landing-reveal>
        <div><p>08 — OPEN SOURCE</p><h2 id="open-source-title">Open code.<br />A transparent roadmap.</h2></div>
        <div className="resource-list">{resources.map((resource) => <OpenSourceCard key={resource.title} {...resource} />)}</div>
      </section>

      <section id="final-cta" className="final-cta cv-auto" data-landing-reveal><LockKeyhole aria-hidden /><h2>Run financial intelligence<br />on your own infrastructure.</h2><p>Open-source architecture, deterministic reasoning and infrastructure you control.</p><div className="landing-actions"><Link href="/product" className="landing-button landing-button-primary atlas-glass-strong"><Code2 size={18} /> Explore Atlas AI</Link><Link href="/demo" className="landing-button landing-button-secondary atlas-glass">Try the Live Demo</Link><Link href="/docs/self-hosting" className="landing-button landing-button-secondary atlas-glass">Self-host Guide</Link></div></section>

      <PublicFooter />
    </main>
  );
}

type OpenSourceCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  external?: boolean;
};

function OpenSourceCard({ title, description, icon: Icon, href, external = false }: OpenSourceCardProps) {
  return (
    <a
      className="resource-card atlas-glass"
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <span className="resource-icon" aria-hidden><Icon strokeWidth={1.8} /></span>
      <span className="resource-content"><strong>{title}</strong><span>{description}</span></span>
      <span className="resource-arrow" aria-hidden><ArrowRight strokeWidth={1.8} /></span>
    </a>
  );
}

function DashboardPreview() {
  return <div className="dashboard-preview atlas-glass-strong" aria-label="Atlas AI dashboard preview">
    <aside><div className="preview-brand"><span>A</span> Atlas AI</div>{["Overview", "Forecasts", "Decisions", "Financial Memory"].map((item, index) => <div className={index === 0 ? "active" : ""} key={item}>{item}</div>)}</aside>
    <div className="preview-main"><div className="preview-top"><span>July financial overview</span><span className="preview-status">Fictional data</span></div>
      <div className="preview-metrics"><article><p>Safe budget</p><strong>₺18,420</strong><small>19 days remaining</small></article><article><p>Risk level</p><strong>Medium</strong><small>2 signals monitored</small></article><article><p>Debt reduction</p><strong>₺6,800</strong><small>Planned payment</small></article></div>
      <div className="preview-content"><article className="forecast-card"><p>30-day forecast</p><svg viewBox="0 0 640 210" role="img" aria-label="Projected net position trend"><path className="chart-area" d="M0 182 C75 166 110 179 160 141 S250 154 310 110 S400 132 462 79 S560 92 640 36 L640 210 L0 210Z"/><path className="chart-line" d="M0 182 C75 166 110 179 160 141 S250 154 310 110 S400 132 462 79 S560 92 640 36"/><path className="chart-dash" d="M462 79 C520 55 575 65 640 36"/></svg><div><span>Today</span><span>30 days</span></div></article>
        <article className="decision-card"><p>Decision summary</p><strong>Minimum payments remain protected.</strong><span>Extra payments are suggested only above the safe-budget threshold.</span><a href="#architecture">Explore the logic <ArrowRight size={15}/></a></article></div>
      <div className="memory-row"><div><MemoryStick size={20}/><span>Financial Memory</span></div><p>Mandatory expense ratio remained stable over the last three months.</p><span>Stable</span></div>
    </div>
  </div>;
}
