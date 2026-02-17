import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Badge } from "./components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Separator } from "./components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";

type ActivityBucket = "completed" | "active" | "blocked" | "other";
type ProviderName = "gitlab" | "jira" | "github";

interface ReportIssueView {
  provider: ProviderName;
  key: string;
  title: string;
  state: string;
  bucket: ActivityBucket;
  impactScore: number;
  updatedAt: string;
  userCommentCount: number;
  isAuthoredByUser: boolean;
  isAssignedToUser: boolean;
  isCommentedByUser: boolean;
  labels: string[];
  descriptionSnippet: string;
  url?: string;
}

interface ReportSummary {
  totalIssues: number;
  byProvider: Record<ProviderName, number>;
  byBucket: Record<ActivityBucket, number>;
  highPriorityLabelIssues: number;
  contribution: {
    contributedIssues: number;
    totalUserComments: number;
  };
  topActivityHighlights: ReportIssueView[];
}

interface WeeklyTalkingPoint {
  lead: string;
  bullets: string[];
}

interface NarrativeSections {
  executiveHeadline: string;
  topHighlightWording: string[];
  collaborationHighlights: string[];
  risksAndFollowUps: string[];
  weeklyTalkingPoints: WeeklyTalkingPoint[];
  aiAssisted: {
    executiveHeadline: boolean;
    topHighlights: boolean;
    weeklyTalkingPoints: boolean;
  };
}

interface ReportContext {
  startDate: string;
  endDate: string;
  fetchMode: string;
  reportProfile: string;
}

interface NormalizedIssue {
  key: string;
  provider: ProviderName;
  state: string;
  bucket: ActivityBucket;
  impactScore: number;
  updatedAt: string;
  isAuthoredByUser: boolean;
  isAssignedToUser: boolean;
  isCommentedByUser: boolean;
  url?: string;
}

interface RenderPayload {
  summary: ReportSummary;
  narrative: NarrativeSections;
  context: ReportContext;
  normalizedIssues: NormalizedIssue[];
}

const IMPACT_LEGEND_ITEMS = [
  "80+: high-impact activity with strong execution and ownership signals.",
  "50-79: meaningful progress with clear contribution momentum.",
  "0-49: lower impact or early-stage activity that still needs follow-through.",
  "Score inputs: completed +40, active +20, blocked +10, authored +15, assigned +10, user comments +2 each (max +10), high-impact labels +12, updated in final 48h +8.",
];

const STYLE_BLOCK = `
  :root {
    --background: 24 35% 97%;
    --foreground: 224 71% 4%;
    --card: 0 0% 100%;
    --card-foreground: 224 71% 4%;
    --muted: 210 20% 96%;
    --muted-foreground: 222 13% 40%;
    --primary: 221 83% 53%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    --accent: 24 95% 53%;
    --accent-foreground: 210 40% 98%;
    --border: 214 32% 90%;
    --ring: 221 83% 53%;
    --radius: 0.9rem;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    color: hsl(var(--foreground));
    font-family: "Manrope", "Segoe UI", sans-serif;
    background:
      radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.17), transparent 32%),
      radial-gradient(circle at 100% 0%, rgba(249, 115, 22, 0.15), transparent 30%),
      radial-gradient(circle at 50% 120%, rgba(14, 165, 233, 0.14), transparent 35%),
      hsl(var(--background));
  }
  .shell {
    max-width: 1200px;
    margin: 0 auto;
    padding: clamp(1rem, 2vw, 1.8rem);
  }
  .hero {
    position: relative;
    overflow: hidden;
  }
  .hero::after {
    content: "";
    position: absolute;
    right: -5rem;
    top: -5rem;
    width: 16rem;
    height: 16rem;
    border-radius: 9999px;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.14), transparent 68%);
  }
  .hero-grid {
    display: grid;
    gap: 1rem;
  }
  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 0.75rem;
    font-weight: 700;
    color: hsl(var(--primary));
  }
  .hero-title {
    margin: 0.2rem 0 0;
    font-size: clamp(2rem, 5vw, 3.2rem);
    line-height: 1;
    letter-spacing: -0.03em;
  }
  .hero-meta {
    margin: 0.7rem 0 0;
    color: hsl(var(--muted-foreground));
    font-size: 0.93rem;
  }
  .headline {
    margin: 0.7rem 0 0;
    font-size: clamp(1rem, 2.2vw, 1.2rem);
    line-height: 1.48;
  }
  .stat-grid {
    display: grid;
    gap: 0.6rem;
  }
  .stat-card {
    border: 1px solid hsl(var(--border));
    background: hsl(var(--card));
    border-radius: 0.75rem;
    padding: 0.7rem 0.8rem;
  }
  .stat-card p {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.73rem;
    color: hsl(var(--muted-foreground));
  }
  .stat-card strong {
    display: block;
    margin-top: 0.2rem;
    font-family: "JetBrains Mono", monospace;
    font-size: 1.6rem;
    line-height: 1;
  }
  .provider-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
    gap: 0.55rem;
    margin-top: 0.95rem;
  }
  .provider-name {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.74rem;
    color: hsl(var(--muted-foreground));
  }
  .provider-track {
    height: 0.35rem;
    background: hsl(var(--secondary));
    border-radius: 9999px;
    overflow: hidden;
    margin-top: 0.4rem;
  }
  .provider-track span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)));
  }
  .section-title {
    font-size: clamp(1.03rem, 2vw, 1.3rem);
    letter-spacing: -0.01em;
    margin: 0;
  }
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.6rem;
  }
  .kpi-card p {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.74rem;
    color: hsl(var(--muted-foreground));
  }
  .kpi-card strong {
    font-family: "JetBrains Mono", monospace;
    font-size: 1.18rem;
  }
  .issue-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0.65rem;
  }
  .issue-card {
    border-left-width: 5px;
  }
  .issue-card.tone-completed { border-left-color: #059669; }
  .issue-card.tone-active { border-left-color: #2563eb; }
  .issue-card.tone-blocked { border-left-color: #ea580c; }
  .issue-card.tone-other { border-left-color: #64748b; }
  .issue-meta {
    color: hsl(var(--muted-foreground));
    font-size: 0.82rem;
    margin: 0.35rem 0 0;
  }
  .issue-copy {
    margin: 0.5rem 0 0;
    line-height: 1.44;
  }
  .issue-pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.38rem;
    margin-top: 0.55rem;
  }
  .issue-label-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.45rem;
  }
  .collab-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.48rem;
  }
  .collab-item {
    border: 1px solid hsl(var(--border));
    border-radius: 0.7rem;
    padding: 0.55rem 0.65rem;
    background: hsl(var(--card));
    color: hsl(var(--muted-foreground));
  }
  .risk-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.6rem;
  }
  .risk-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.6rem;
  }
  .risk-index {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 9999px;
    background: rgba(249, 115, 22, 0.2);
    color: #9a3412;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.74rem;
  }
  .risk-context {
    margin: 0;
    color: hsl(var(--muted-foreground));
    font-family: "JetBrains Mono", monospace;
    font-size: 0.72rem;
  }
  .risk-action {
    margin: 0.18rem 0 0;
    line-height: 1.45;
  }
  .talk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.65rem;
  }
  .empty-state {
    border: 1px dashed hsl(var(--border));
    border-radius: 0.7rem;
    padding: 0.7rem;
    color: hsl(var(--muted-foreground));
    font-style: italic;
    margin: 0;
  }
  .report-table th,
  .report-table td {
    white-space: nowrap;
  }
  .mono {
    font-family: "JetBrains Mono", monospace;
  }
  .generated {
    margin-top: 0.8rem;
    color: hsl(var(--muted-foreground));
    font-size: 0.76rem;
    font-family: "JetBrains Mono", monospace;
  }
  @media (min-width: 920px) {
    .hero-grid {
      grid-template-columns: 1.25fr 0.75fr;
      align-items: end;
    }
    .collab-grid {
      display: grid;
      grid-template-columns: minmax(250px, 320px) 1fr;
      gap: 0.7rem;
      align-items: start;
    }
  }
  @media (max-width: 760px) {
    .risk-item {
      grid-template-columns: 1fr;
    }
  }
`;

const BUCKET_LABEL: Record<ActivityBucket, string> = {
  completed: "Completed",
  active: "Active",
  blocked: "Blocked",
  other: "Other",
};

const BUCKET_BADGE_CLASS: Record<ActivityBucket, string> = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  active: "bg-blue-100 text-blue-700 border-blue-200",
  blocked: "bg-orange-100 text-orange-700 border-orange-200",
  other: "bg-slate-100 text-slate-700 border-slate-200",
};

const PROVIDER_LABEL: Record<ProviderName, string> = {
  gitlab: "GitLab",
  jira: "Jira",
  github: "GitHub",
};

function formatHumanDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(parsed));
}

function formatHumanDate(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(parsed));
}

function parseRiskLine(value: string): { context: string; action: string } {
  const match = value.match(/^\[([^\]]+)\]\s*(.+)$/);
  if (!match) {
    return { context: "Follow-up", action: value };
  }
  return { context: match[1], action: match[2] };
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      raw += chunk;
    });
    process.stdin.on("end", () => resolve(raw));
    process.stdin.on("error", reject);
  });
}

function ReportDocument({ payload }: { payload: RenderPayload }) {
  const { summary, narrative, context, normalizedIssues } = payload;
  const generatedAt = formatHumanDateTime(new Date().toISOString());
  const windowLabel = `${formatHumanDate(context.startDate)} -> ${
    formatHumanDate(context.endDate)
  }`;

  const providers = [
    { name: "GitLab", value: summary.byProvider.gitlab },
    { name: "Jira", value: summary.byProvider.jira },
    { name: "GitHub", value: summary.byProvider.github },
  ];
  const providerTotal = providers.reduce(
    (sum, provider) => sum + provider.value,
    0,
  );

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Activity Report (ShadCN Package)</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html:
              `tailwind.config = { theme: { extend: { fontFamily: { sans: [\"Manrope\", \"ui-sans-serif\", \"system-ui\", \"sans-serif\"], mono: [\"JetBrains Mono\", \"ui-monospace\", \"SFMono-Regular\", \"monospace\"] } } } };`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: STYLE_BLOCK }} />
      </head>
      <body>
        <main className="shell space-y-4">
          <Card className="hero border-border/70 bg-card/95">
            <CardContent className="pt-0">
              <div className="hero-grid">
                <div>
                  <p className="eyebrow">shadcn/ui package renderer</p>
                  <h1 className="hero-title">Engineering Activity Report</h1>
                  <p className="hero-meta">
                    Window: {windowLabel} | Fetch Mode: {context.fetchMode}{" "}
                    | Profile: {context.reportProfile}
                  </p>
                  <p className="hero-meta">
                    Executive Headline
                    {narrative.aiAssisted.executiveHeadline
                      ? (
                        <Badge className="ml-2" variant="default">
                          AI-assisted
                        </Badge>
                      )
                      : null}
                  </p>
                  <p className="headline">{narrative.executiveHeadline}</p>
                </div>

                <aside className="stat-grid">
                  <div className="stat-card">
                    <p>Total Issues</p>
                    <strong>{summary.totalIssues}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Contributed Issues</p>
                    <strong>{summary.contribution.contributedIssues}</strong>
                  </div>
                  <div className="stat-card">
                    <p>User Comments</p>
                    <strong>{summary.contribution.totalUserComments}</strong>
                  </div>
                </aside>
              </div>

              <div className="provider-grid">
                {providers.map((provider) => {
                  const percentage = providerTotal > 0
                    ? Math.round((provider.value / providerTotal) * 100)
                    : 0;
                  return (
                    <Card key={provider.name} className="provider-card py-3">
                      <CardContent className="px-3">
                        <p className="provider-name">{provider.name}</p>
                        <p className="mono text-base font-semibold">
                          {provider.value}
                        </p>
                        <div className="provider-track" aria-hidden="true">
                          <span style={{ width: `${percentage}%` }}></span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <p className="generated">Generated: {generatedAt}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="section-title">KPI Row</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="kpi-grid">
                {[
                  ["Total Issues", summary.totalIssues],
                  ["Completed", summary.byBucket.completed],
                  ["Active", summary.byBucket.active],
                  ["Blocked", summary.byBucket.blocked],
                  [
                    "Contributed Issues",
                    summary.contribution.contributedIssues,
                  ],
                  ["User Comments", summary.contribution.totalUserComments],
                  [
                    "High-Priority Label Issues",
                    summary.highPriorityLabelIssues,
                  ],
                  ["GitLab Issues", summary.byProvider.gitlab],
                  ["Jira Issues", summary.byProvider.jira],
                  ["GitHub Issues", summary.byProvider.github],
                ].map(([label, value]) => (
                  <Card key={String(label)} className="kpi-card py-4">
                    <CardContent className="px-4">
                      <p>{label}</p>
                      <strong className="mono">{value}</strong>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="section-title">Impact Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {IMPACT_LEGEND_ITEMS.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="section-title">
                Top Activity Highlights
                {narrative.aiAssisted.topHighlights
                  ? (
                    <Badge className="ml-2" variant="default">
                      AI-assisted
                    </Badge>
                  )
                  : null}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary.topActivityHighlights.length === 0
                ? <p className="empty-state">No highlights selected.</p>
                : (
                  <div className="issue-grid">
                    {summary.topActivityHighlights.map((issue, index) => {
                      const wording = narrative.topHighlightWording[index] ??
                        issue.descriptionSnippet;
                      const contribution = [
                        issue.isAuthoredByUser ? "authored" : null,
                        issue.isAssignedToUser ? "assigned" : null,
                        issue.isCommentedByUser
                          ? `commented (${issue.userCommentCount})`
                          : null,
                      ].filter(Boolean).join(", ");

                      return (
                        <Card
                          key={`${issue.provider}-${issue.key}`}
                          className={`issue-card ${
                            bucketToneClass(issue.bucket)
                          }`}
                        >
                          <CardContent className="px-4">
                            <div className="flex items-start justify-between gap-2">
                              <p className="mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                                {PROVIDER_LABEL[issue.provider]}
                              </p>
                              <Badge variant="secondary" className="mono">
                                Impact {issue.impactScore}
                              </Badge>
                            </div>

                            <h3 className="mt-1 text-base font-semibold leading-tight">
                              {issue.url
                                ? (
                                  <a
                                    className="text-primary hover:underline"
                                    href={issue.url}
                                  >
                                    {issue.key}
                                  </a>
                                )
                                : <span>{issue.key}</span>}
                              <span className="ml-1 font-medium text-foreground/85">
                                {issue.title}
                              </span>
                            </h3>

                            <p className="issue-meta">
                              {issue.bucket} • {issue.state} • Updated{" "}
                              {formatHumanDateTime(issue.updatedAt)}
                            </p>
                            <p className="issue-copy text-sm">{wording}</p>

                            <div className="issue-pill-row">
                              <Badge
                                className={BUCKET_BADGE_CLASS[issue.bucket]}
                                variant="outline"
                              >
                                {BUCKET_LABEL[issue.bucket]}
                              </Badge>
                              {contribution
                                ? (
                                  <Badge variant="secondary">
                                    {contribution}
                                  </Badge>
                                )
                                : (
                                  <Badge variant="outline">
                                    no direct attribution
                                  </Badge>
                                )}
                            </div>

                            {issue.labels.length
                              ? (
                                <div className="issue-label-row">
                                  {issue.labels.map((label) => (
                                    <Badge
                                      key={label}
                                      variant="outline"
                                      className="bg-orange-50 text-orange-800"
                                    >
                                      #{label}
                                    </Badge>
                                  ))}
                                </div>
                              )
                              : null}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="section-title">
                Collaboration Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="collab-grid">
                <Card className="bg-blue-50/80">
                  <CardHeader>
                    <CardDescription>
                      Total collaborative issues
                    </CardDescription>
                    <CardTitle className="mono text-5xl">
                      {summary.contribution.contributedIssues}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <ul className="collab-list">
                  {narrative.collaborationHighlights.length
                    ? narrative.collaborationHighlights.map((line, index) => (
                      <li key={`${line}-${index}`} className="collab-item">
                        {line}
                      </li>
                    ))
                    : (
                      <li className="empty-state">
                        No additional collaboration narrative available.
                      </li>
                    )}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="section-title">
                Risks and Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="risk-list">
                {narrative.risksAndFollowUps.length
                  ? narrative.risksAndFollowUps.map((line, index) => {
                    const parsed = parseRiskLine(line);
                    return (
                      <li key={`${line}-${index}`} className="risk-item">
                        <span className="risk-index">{index + 1}</span>
                        <Card className="py-4">
                          <CardContent className="px-4">
                            <p className="risk-context">{parsed.context}</p>
                            <p className="risk-action">{parsed.action}</p>
                          </CardContent>
                        </Card>
                      </li>
                    );
                  })
                  : (
                    <li className="empty-state">
                      No immediate follow-up actions required.
                    </li>
                  )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="section-title">
                Weekly Activity Talking Points
                {narrative.aiAssisted.weeklyTalkingPoints
                  ? (
                    <Badge className="ml-2" variant="default">
                      AI-assisted
                    </Badge>
                  )
                  : null}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {narrative.weeklyTalkingPoints.length
                ? (
                  <div className="talk-grid">
                    {narrative.weeklyTalkingPoints.map((point, index) => (
                      <Card
                        key={`${point.lead}-${index}`}
                        className="talk-card"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            {point.lead}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {point.bullets.length
                            ? (
                              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                {point.bullets.map((bullet, bulletIndex) => (
                                  <li key={`${bullet}-${bulletIndex}`}>
                                    {bullet}
                                  </li>
                                ))}
                              </ul>
                            )
                            : (
                              <p className="empty-state">
                                No additional detail.
                              </p>
                            )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
                : <p className="empty-state">No talking points generated.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="section-title">Appendix</CardTitle>
              <CardDescription>
                Ranked issue appendix with deterministic attribution fields.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border">
                <Table className="report-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Bucket</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Authored</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Commented</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {normalizedIssues.length
                      ? normalizedIssues.map((issue, index) => (
                        <TableRow
                          key={`${issue.provider}-${issue.key}-${index}`}
                        >
                          <TableCell className="mono">{index + 1}</TableCell>
                          <TableCell>
                            {issue.url
                              ? (
                                <a
                                  className="text-primary hover:underline"
                                  href={issue.url}
                                >
                                  {issue.key}
                                </a>
                              )
                              : <span>{issue.key}</span>}
                          </TableCell>
                          <TableCell>
                            {PROVIDER_LABEL[issue.provider]}
                          </TableCell>
                          <TableCell>{issue.state}</TableCell>
                          <TableCell>
                            <Badge
                              className={BUCKET_BADGE_CLASS[issue.bucket]}
                              variant="outline"
                            >
                              {issue.bucket}
                            </Badge>
                          </TableCell>
                          <TableCell className="mono">
                            {issue.impactScore}
                          </TableCell>
                          <TableCell>
                            {formatHumanDateTime(issue.updatedAt)}
                          </TableCell>
                          <TableCell className="mono">
                            {issue.isAuthoredByUser ? "yes" : "no"}
                          </TableCell>
                          <TableCell className="mono">
                            {issue.isAssignedToUser ? "yes" : "no"}
                          </TableCell>
                          <TableCell className="mono">
                            {issue.isCommentedByUser ? "yes" : "no"}
                          </TableCell>
                        </TableRow>
                      ))
                      : (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            className="text-center text-muted-foreground"
                          >
                            No issues available.
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Separator />
        </main>
      </body>
    </html>
  );
}

function bucketToneClass(bucket: ActivityBucket): string {
  if (bucket === "completed") return "tone-completed";
  if (bucket === "blocked") return "tone-blocked";
  if (bucket === "active") return "tone-active";
  return "tone-other";
}

async function main() {
  const rawInput = await readStdin();
  const payload = JSON.parse(rawInput) as RenderPayload;
  const html = "<!doctype html>" +
    renderToStaticMarkup(<ReportDocument payload={payload} />);
  process.stdout.write(html);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`shadcn renderer failed: ${message}\n`);
  process.exit(1);
});
