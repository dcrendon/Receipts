import { jsx, jsxs } from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      ),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn("leading-none font-semibold", className),
      ...props
    }
  );
}
function CardDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6", className),
      ...props
    }
  );
}
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: decorative ? "none" : "separator",
      "aria-orientation": orientation,
      "data-slot": "separator",
      className: cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      ),
      ...props
    }
  );
}
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "table-container",
      className: "relative w-full overflow-x-auto",
      children: /* @__PURE__ */ jsx(
        "table",
        {
          "data-slot": "table",
          className: cn("w-full caption-bottom text-sm", className),
          ...props
        }
      )
    }
  );
}
function TableHeader({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "thead",
    {
      "data-slot": "table-header",
      className: cn("[&_tr]:border-b", className),
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tbody",
    {
      "data-slot": "table-body",
      className: cn("[&_tr:last-child]:border-0", className),
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tr",
    {
      "data-slot": "table-row",
      className: cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b",
        className
      ),
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "th",
    {
      "data-slot": "table-head",
      className: cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap",
        className
      ),
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "td",
    {
      "data-slot": "table-cell",
      className: cn("p-2 align-middle whitespace-nowrap", className),
      ...props
    }
  );
}
const IMPACT_LEGEND_ITEMS = [
  "80+: high-impact activity with strong execution and ownership signals.",
  "50-79: meaningful progress with clear contribution momentum.",
  "0-49: lower impact or early-stage activity that still needs follow-through.",
  "Score inputs: completed +40, active +20, blocked +10, authored +15, assigned +10, user comments +2 each (max +10), high-impact labels +12, updated in final 48h +8."
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
const BUCKET_LABEL = {
  completed: "Completed",
  active: "Active",
  blocked: "Blocked",
  other: "Other"
};
const BUCKET_BADGE_CLASS = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  active: "bg-blue-100 text-blue-700 border-blue-200",
  blocked: "bg-orange-100 text-orange-700 border-orange-200",
  other: "bg-slate-100 text-slate-700 border-slate-200"
};
const PROVIDER_LABEL = {
  gitlab: "GitLab",
  jira: "Jira",
  github: "GitHub"
};
function formatHumanDateTime(value) {
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
    timeZoneName: "short"
  }).format(new Date(parsed));
}
function formatHumanDate(value) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(parsed));
}
function parseRiskLine(value) {
  const match = value.match(/^\[([^\]]+)\]\s*(.+)$/);
  if (!match) {
    return { context: "Follow-up", action: value };
  }
  return { context: match[1], action: match[2] };
}
function readStdin() {
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
function ReportDocument({ payload }) {
  const { summary, narrative, context, normalizedIssues } = payload;
  const generatedAt = formatHumanDateTime((/* @__PURE__ */ new Date()).toISOString());
  const windowLabel = `${formatHumanDate(context.startDate)} -> ${formatHumanDate(context.endDate)}`;
  const providers = [
    { name: "GitLab", value: summary.byProvider.gitlab },
    { name: "Jira", value: summary.byProvider.jira },
    { name: "GitHub", value: summary.byProvider.github }
  ];
  const providerTotal = providers.reduce(
    (sum, provider) => sum + provider.value,
    0
  );
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx("title", { children: "Activity Report (ShadCN Package)" }),
      /* @__PURE__ */ jsx("script", { src: "https://cdn.tailwindcss.com" }),
      /* @__PURE__ */ jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `tailwind.config = { theme: { extend: { fontFamily: { sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"], mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"] } } } };`
          }
        }
      ),
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
      /* @__PURE__ */ jsx(
        "link",
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: ""
        }
      ),
      /* @__PURE__ */ jsx(
        "link",
        {
          href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap",
          rel: "stylesheet"
        }
      ),
      /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: STYLE_BLOCK } })
    ] }),
    /* @__PURE__ */ jsx("body", { children: /* @__PURE__ */ jsxs("main", { className: "shell space-y-4", children: [
      /* @__PURE__ */ jsx(Card, { className: "hero border-border/70 bg-card/95", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "hero-grid", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "eyebrow", children: "shadcn/ui package renderer" }),
            /* @__PURE__ */ jsx("h1", { className: "hero-title", children: "Engineering Activity Report" }),
            /* @__PURE__ */ jsxs("p", { className: "hero-meta", children: [
              "Window: ",
              windowLabel,
              " | Fetch Mode: ",
              context.fetchMode,
              " ",
              "| Profile: ",
              context.reportProfile
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "hero-meta", children: [
              "Executive Headline",
              narrative.aiAssisted.executiveHeadline ? /* @__PURE__ */ jsx(Badge, { className: "ml-2", variant: "default", children: "AI-assisted" }) : null
            ] }),
            /* @__PURE__ */ jsx("p", { className: "headline", children: narrative.executiveHeadline })
          ] }),
          /* @__PURE__ */ jsxs("aside", { className: "stat-grid", children: [
            /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
              /* @__PURE__ */ jsx("p", { children: "Total Issues" }),
              /* @__PURE__ */ jsx("strong", { children: summary.totalIssues })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
              /* @__PURE__ */ jsx("p", { children: "Contributed Issues" }),
              /* @__PURE__ */ jsx("strong", { children: summary.contribution.contributedIssues })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
              /* @__PURE__ */ jsx("p", { children: "User Comments" }),
              /* @__PURE__ */ jsx("strong", { children: summary.contribution.totalUserComments })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "provider-grid", children: providers.map((provider) => {
          const percentage = providerTotal > 0 ? Math.round(provider.value / providerTotal * 100) : 0;
          return /* @__PURE__ */ jsx(Card, { className: "provider-card py-3", children: /* @__PURE__ */ jsxs(CardContent, { className: "px-3", children: [
            /* @__PURE__ */ jsx("p", { className: "provider-name", children: provider.name }),
            /* @__PURE__ */ jsx("p", { className: "mono text-base font-semibold", children: provider.value }),
            /* @__PURE__ */ jsx("div", { className: "provider-track", "aria-hidden": "true", children: /* @__PURE__ */ jsx("span", { style: { width: `${percentage}%` } }) })
          ] }) }, provider.name);
        }) }),
        /* @__PURE__ */ jsxs("p", { className: "generated", children: [
          "Generated: ",
          generatedAt
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "section-title", children: "KPI Row" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "kpi-grid", children: [
          ["Total Issues", summary.totalIssues],
          ["Completed", summary.byBucket.completed],
          ["Active", summary.byBucket.active],
          ["Blocked", summary.byBucket.blocked],
          [
            "Contributed Issues",
            summary.contribution.contributedIssues
          ],
          ["User Comments", summary.contribution.totalUserComments],
          [
            "High-Priority Label Issues",
            summary.highPriorityLabelIssues
          ],
          ["GitLab Issues", summary.byProvider.gitlab],
          ["Jira Issues", summary.byProvider.jira],
          ["GitHub Issues", summary.byProvider.github]
        ].map(([label, value]) => /* @__PURE__ */ jsx(Card, { className: "kpi-card py-4", children: /* @__PURE__ */ jsxs(CardContent, { className: "px-4", children: [
          /* @__PURE__ */ jsx("p", { children: label }),
          /* @__PURE__ */ jsx("strong", { className: "mono", children: value })
        ] }) }, String(label))) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "section-title", children: "Impact Legend" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("ul", { className: "list-disc space-y-1 pl-5 text-sm text-muted-foreground", children: IMPACT_LEGEND_ITEMS.map((item) => /* @__PURE__ */ jsx("li", { children: item }, item)) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "section-title", children: [
          "Top Activity Highlights",
          narrative.aiAssisted.topHighlights ? /* @__PURE__ */ jsx(Badge, { className: "ml-2", variant: "default", children: "AI-assisted" }) : null
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: summary.topActivityHighlights.length === 0 ? /* @__PURE__ */ jsx("p", { className: "empty-state", children: "No highlights selected." }) : /* @__PURE__ */ jsx("div", { className: "issue-grid", children: summary.topActivityHighlights.map((issue, index) => {
          const wording = narrative.topHighlightWording[index] ?? issue.descriptionSnippet;
          const contribution = [
            issue.isAuthoredByUser ? "authored" : null,
            issue.isAssignedToUser ? "assigned" : null,
            issue.isCommentedByUser ? `commented (${issue.userCommentCount})` : null
          ].filter(Boolean).join(", ");
          return /* @__PURE__ */ jsx(
            Card,
            {
              className: `issue-card ${bucketToneClass(issue.bucket)}`,
              children: /* @__PURE__ */ jsxs(CardContent, { className: "px-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground", children: PROVIDER_LABEL[issue.provider] }),
                  /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "mono", children: [
                    "Impact ",
                    issue.impactScore
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("h3", { className: "mt-1 text-base font-semibold leading-tight", children: [
                  issue.url ? /* @__PURE__ */ jsx(
                    "a",
                    {
                      className: "text-primary hover:underline",
                      href: issue.url,
                      children: issue.key
                    }
                  ) : /* @__PURE__ */ jsx("span", { children: issue.key }),
                  /* @__PURE__ */ jsx("span", { className: "ml-1 font-medium text-foreground/85", children: issue.title })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "issue-meta", children: [
                  issue.bucket,
                  " • ",
                  issue.state,
                  " • Updated",
                  " ",
                  formatHumanDateTime(issue.updatedAt)
                ] }),
                /* @__PURE__ */ jsx("p", { className: "issue-copy text-sm", children: wording }),
                /* @__PURE__ */ jsxs("div", { className: "issue-pill-row", children: [
                  /* @__PURE__ */ jsx(
                    Badge,
                    {
                      className: BUCKET_BADGE_CLASS[issue.bucket],
                      variant: "outline",
                      children: BUCKET_LABEL[issue.bucket]
                    }
                  ),
                  contribution ? /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: contribution }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "no direct attribution" })
                ] }),
                issue.labels.length ? /* @__PURE__ */ jsx("div", { className: "issue-label-row", children: issue.labels.map((label) => /* @__PURE__ */ jsxs(
                  Badge,
                  {
                    variant: "outline",
                    className: "bg-orange-50 text-orange-800",
                    children: [
                      "#",
                      label
                    ]
                  },
                  label
                )) }) : null
              ] })
            },
            `${issue.provider}-${issue.key}`
          );
        }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "section-title", children: "Collaboration Highlights" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "collab-grid", children: [
          /* @__PURE__ */ jsx(Card, { className: "bg-blue-50/80", children: /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardDescription, { children: "Total collaborative issues" }),
            /* @__PURE__ */ jsx(CardTitle, { className: "mono text-5xl", children: summary.contribution.contributedIssues })
          ] }) }),
          /* @__PURE__ */ jsx("ul", { className: "collab-list", children: narrative.collaborationHighlights.length ? narrative.collaborationHighlights.map((line, index) => /* @__PURE__ */ jsx("li", { className: "collab-item", children: line }, `${line}-${index}`)) : /* @__PURE__ */ jsx("li", { className: "empty-state", children: "No additional collaboration narrative available." }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "section-title", children: "Risks and Follow-ups" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("ul", { className: "risk-list", children: narrative.risksAndFollowUps.length ? narrative.risksAndFollowUps.map((line, index) => {
          const parsed = parseRiskLine(line);
          return /* @__PURE__ */ jsxs("li", { className: "risk-item", children: [
            /* @__PURE__ */ jsx("span", { className: "risk-index", children: index + 1 }),
            /* @__PURE__ */ jsx(Card, { className: "py-4", children: /* @__PURE__ */ jsxs(CardContent, { className: "px-4", children: [
              /* @__PURE__ */ jsx("p", { className: "risk-context", children: parsed.context }),
              /* @__PURE__ */ jsx("p", { className: "risk-action", children: parsed.action })
            ] }) })
          ] }, `${line}-${index}`);
        }) : /* @__PURE__ */ jsx("li", { className: "empty-state", children: "No immediate follow-up actions required." }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "section-title", children: [
          "Weekly Activity Talking Points",
          narrative.aiAssisted.weeklyTalkingPoints ? /* @__PURE__ */ jsx(Badge, { className: "ml-2", variant: "default", children: "AI-assisted" }) : null
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: narrative.weeklyTalkingPoints.length ? /* @__PURE__ */ jsx("div", { className: "talk-grid", children: narrative.weeklyTalkingPoints.map((point, index) => /* @__PURE__ */ jsxs(
          Card,
          {
            className: "talk-card",
            children: [
              /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: point.lead }) }),
              /* @__PURE__ */ jsx(CardContent, { children: point.bullets.length ? /* @__PURE__ */ jsx("ul", { className: "list-disc space-y-1 pl-5 text-sm text-muted-foreground", children: point.bullets.map((bullet, bulletIndex) => /* @__PURE__ */ jsx("li", { children: bullet }, `${bullet}-${bulletIndex}`)) }) : /* @__PURE__ */ jsx("p", { className: "empty-state", children: "No additional detail." }) })
            ]
          },
          `${point.lead}-${index}`
        )) }) : /* @__PURE__ */ jsx("p", { className: "empty-state", children: "No talking points generated." }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "section-title", children: "Appendix" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Ranked issue appendix with deterministic attribution fields." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "rounded-xl border", children: /* @__PURE__ */ jsxs(Table, { className: "report-table", children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Rank" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Issue" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Provider" }),
            /* @__PURE__ */ jsx(TableHead, { children: "State" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Bucket" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Impact" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Updated" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Authored" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Assigned" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Commented" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: normalizedIssues.length ? normalizedIssues.map((issue, index) => /* @__PURE__ */ jsxs(
            TableRow,
            {
              children: [
                /* @__PURE__ */ jsx(TableCell, { className: "mono", children: index + 1 }),
                /* @__PURE__ */ jsx(TableCell, { children: issue.url ? /* @__PURE__ */ jsx(
                  "a",
                  {
                    className: "text-primary hover:underline",
                    href: issue.url,
                    children: issue.key
                  }
                ) : /* @__PURE__ */ jsx("span", { children: issue.key }) }),
                /* @__PURE__ */ jsx(TableCell, { children: PROVIDER_LABEL[issue.provider] }),
                /* @__PURE__ */ jsx(TableCell, { children: issue.state }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(
                  Badge,
                  {
                    className: BUCKET_BADGE_CLASS[issue.bucket],
                    variant: "outline",
                    children: issue.bucket
                  }
                ) }),
                /* @__PURE__ */ jsx(TableCell, { className: "mono", children: issue.impactScore }),
                /* @__PURE__ */ jsx(TableCell, { children: formatHumanDateTime(issue.updatedAt) }),
                /* @__PURE__ */ jsx(TableCell, { className: "mono", children: issue.isAuthoredByUser ? "yes" : "no" }),
                /* @__PURE__ */ jsx(TableCell, { className: "mono", children: issue.isAssignedToUser ? "yes" : "no" }),
                /* @__PURE__ */ jsx(TableCell, { className: "mono", children: issue.isCommentedByUser ? "yes" : "no" })
              ]
            },
            `${issue.provider}-${issue.key}-${index}`
          )) : /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(
            TableCell,
            {
              colSpan: 10,
              className: "text-center text-muted-foreground",
              children: "No issues available."
            }
          ) }) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsx(Separator, {})
    ] }) })
  ] });
}
function bucketToneClass(bucket) {
  if (bucket === "completed") return "tone-completed";
  if (bucket === "blocked") return "tone-blocked";
  if (bucket === "active") return "tone-active";
  return "tone-other";
}
async function main() {
  const rawInput = await readStdin();
  const payload = JSON.parse(rawInput);
  const html = "<!doctype html>" + renderToStaticMarkup(/* @__PURE__ */ jsx(ReportDocument, { payload }));
  process.stdout.write(html);
}
main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`shadcn renderer failed: ${message}
`);
  process.exit(1);
});
