/**
 * Shared domain classification rules.
 *
 * Lifted verbatim from skills-explorer/scripts/scan-skills.mjs so both the
 * catalog builder (skills-mcp/scripts/build-catalog.mjs) and any consumer can
 * tag skills consistently.
 *
 * Each domain has a list of regexes; if any regex matches, the domain id is
 * added to the skill's tag list. The first matching domain becomes the
 * `primaryTag`. If nothing matches, the skill falls back to "other".
 */

export const DOMAINS = [
  {
    id: "testing",
    label: "Testing & QA",
    icon: "FlaskConical",
    color: "#22c55e",
    keywords: [
      /\btest(s|ing|er|ed)?\b/i, /\btdd\b/i, /\bqa\b/i, /\bspec\b/i,
      /\bjest\b/i, /\bvitest\b/i, /\bplaywright\b/i, /\bcypress\b/i,
      /\be2e\b/i, /\bunit[- ]test/i, /\bregression\b/i, /\bsmoke\b/i,
    ],
  },
  {
    id: "debugging",
    label: "Debugging",
    icon: "Bug",
    color: "#ef4444",
    keywords: [
      /\bdebug(ging|ger)?\b/i, /\btroubleshoot/i, /\bdiagnos/i,
      /\berror[- ]trac/i, /\bstack trace/i, /\bbug[- ]?(scan|find|fix)/i,
      /\broot[- ]cause/i, /\bsystematic[- ]debug/i,
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: "Shield",
    color: "#f59e0b",
    keywords: [
      /\bsecur(ity|e)\b/i, /\bvuln/i, /\bauth(n|z)\b/i, /\boauth\b/i,
      /\bxss\b/i, /\bcsrf\b/i, /\bsqli\b/i, /\bpenetration\b/i,
      /\bpentest/i, /\bcompliance\b/i, /\bsoc[ -]?2\b/i, /\biso ?27001\b/i,
      /\bgdpr\b/i, /\bhipaa\b/i, /\bencrypt/i, /\bjwt\b/i, /\bsast\b/i,
    ],
  },
  {
    id: "devops",
    label: "DevOps & Infra",
    icon: "Server",
    color: "#06b6d4",
    keywords: [
      /\bdocker\b/i, /\bkubernetes\b/i, /\bk8s\b/i, /\bhelm\b/i,
      /\bterraform\b/i, /\bansible\b/i, /\bci[\/ -]?cd\b/i,
      /\bgithub[- ]actions\b/i, /\bgitlab[- ]ci\b/i, /\bjenkins\b/i,
      /\baws\b/i, /\bgcp\b/i, /\bazure\b/i, /\bcloud\b/i,
      /\bdeploy(ment)?\b/i, /\binfrastructure\b/i, /\bnginx\b/i,
      /\bprometheus\b/i, /\bgrafana\b/i, /\bobservab/i, /\bmonitor/i,
      /\bsre\b/i, /\bincident\b/i, /\bsl[oa]\b/i,
    ],
  },
  {
    id: "data",
    label: "Data & Databases",
    icon: "Database",
    color: "#8b5cf6",
    keywords: [
      /\bdatabase\b/i, /\bsql\b/i, /\bpostgres\b/i, /\bmysql\b/i,
      /\bmongo\b/i, /\bredis\b/i, /\bsupabase\b/i, /\bplanetscale\b/i,
      /\bprisma\b/i, /\bdrizzle\b/i, /\btypeorm\b/i, /\bschema\b/i,
      /\bmigration\b/i, /\betl\b/i, /\bdata[- ](pipeline|engineering)/i,
      /\banalytics\b/i, /\bwarehouse\b/i, /\bsnowflake\b/i,
    ],
  },
  {
    id: "ai-ml",
    label: "AI / ML / LLM",
    icon: "Sparkles",
    color: "#ec4899",
    keywords: [
      /\bllm\b/i, /\bai\b/i, /\bml\b/i, /\bmachine[- ]learning\b/i,
      /\bgpt\b/i, /\bclaude\b/i, /\bgemini\b/i, /\bagent(s|ic)?\b/i,
      /\bmcp\b/i, /\bprompt\b/i, /\brag\b/i, /\bembedding/i,
      /\blangchain\b/i, /\bvector[- ]db/i, /\bopen[- ]?ai\b/i,
      /\bmodel\b/i, /\binference\b/i, /\bfine[- ]tun/i,
    ],
  },
  {
    id: "frontend",
    label: "Frontend & UI",
    icon: "Layout",
    color: "#3b82f6",
    keywords: [
      /\breact\b/i, /\bvue\b/i, /\bsvelte\b/i, /\bnext\.?js\b/i,
      /\bnuxt\b/i, /\bremix\b/i, /\bangular\b/i, /\bsolid\b/i,
      /\btailwind\b/i, /\bcss\b/i, /\bui\b/i, /\buix\b/i,
      /\bdesign[- ]system\b/i, /\baccessibility\b/i, /\ba11y\b/i,
      /\bresponsive\b/i, /\bdark[- ]mode\b/i, /\bcomponent\b/i,
      /\bstorybook\b/i, /\bshadcn\b/i, /\bradix\b/i, /\bvitepress\b/i,
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: "Smartphone",
    color: "#0ea5e9",
    keywords: [
      /\bios\b/i, /\bandroid\b/i, /\bswift(ui)?\b/i, /\bjetpack\b/i,
      /\bcompose\b/i, /\breact[- ]native\b/i, /\bflutter\b/i,
      /\bexpo\b/i, /\bmobile\b/i,
    ],
  },
  {
    id: "backend",
    label: "Backend & APIs",
    icon: "Code",
    color: "#14b8a6",
    keywords: [
      /\bapi\b/i, /\brest\b/i, /\bgraphql\b/i, /\btrpc\b/i,
      /\bbackend\b/i, /\bserver\b/i, /\bmicroservice\b/i,
      /\bnode\b/i, /\bexpress\b/i, /\bfastify\b/i, /\bnestjs\b/i,
      /\bdjango\b/i, /\bflask\b/i, /\bfastapi\b/i, /\brails\b/i,
      /\bgo\b/i, /\bgolang\b/i, /\brust\b/i, /\bspring\b/i,
      /\bwebsocket\b/i, /\bgrpc\b/i, /\bwebhook\b/i,
    ],
  },
  {
    id: "documents",
    label: "Documents",
    icon: "FileText",
    color: "#a855f7",
    keywords: [
      /\bpdf\b/i, /\bdocx\b/i, /\bpptx\b/i, /\bxlsx\b/i,
      /\bdocument\b/i, /\bword\b/i, /\bexcel\b/i, /\bpowerpoint\b/i,
      /\bspreadsheet\b/i, /\bmarkdown\b/i,
    ],
  },
  {
    id: "git-collab",
    label: "Git & Collaboration",
    icon: "GitBranch",
    color: "#f97316",
    keywords: [
      /\bgit\b/i, /\bgithub\b/i, /\bpull[- ]request\b/i, /\bpr\b/i,
      /\bcommit\b/i, /\bbranch\b/i, /\bcode[- ]review\b/i,
      /\bmerge\b/i, /\brebase\b/i, /\bworktree\b/i,
    ],
  },
  {
    id: "performance",
    label: "Performance",
    icon: "Zap",
    color: "#eab308",
    keywords: [
      /\bperformance\b/i, /\bprofil/i, /\boptim/i, /\bbenchmark/i,
      /\bcache\b/i, /\bcaching\b/i, /\bcore[- ]web[- ]vitals\b/i,
      /\blatency\b/i, /\bthroughput\b/i, /\bn\+1\b/i,
    ],
  },
  {
    id: "design",
    label: "Design & Creative",
    icon: "Palette",
    color: "#d946ef",
    keywords: [
      /\bdesign\b/i, /\bcanvas\b/i, /\bbrand\b/i, /\btheme\b/i,
      /\bart\b/i, /\bcreativ/i, /\billustrat/i, /\bfigma\b/i,
      /\bicon\b/i, /\bgif\b/i, /\bimage\b/i, /\bvideo\b/i,
    ],
  },
  {
    id: "marketing-content",
    label: "Marketing & Content",
    icon: "Megaphone",
    color: "#f43f5e",
    keywords: [
      /\bmarketing\b/i, /\bseo\b/i, /\bcontent\b/i, /\bcopy\b/i,
      /\bgrowth\b/i, /\bcro\b/i, /\blanding\b/i, /\bblog\b/i,
      /\bsocial[- ]media\b/i, /\btwitter\b/i, /\bx[- ]marketing\b/i,
      /\bemail\b/i, /\bnewsletter\b/i, /\bcampaign\b/i, /\bbrand/i,
      /\bpaid[- ]ads\b/i, /\bppc\b/i,
    ],
  },
  {
    id: "business-pm",
    label: "Business & PM",
    icon: "Briefcase",
    color: "#0d9488",
    keywords: [
      /\bproduct[- ]manag/i, /\bpm\b/i, /\bagile\b/i, /\bscrum\b/i,
      /\bjira\b/i, /\bconfluence\b/i, /\batlassian\b/i, /\broadmap\b/i,
      /\bproject[- ]manag/i, /\bok ?r\b/i, /\bkpi\b/i, /\bstrategy\b/i,
      /\bfinance\b/i, /\bsales\b/i, /\bcustomer\b/i, /\bcrm\b/i,
      /\bhr\b/i, /\blegal\b/i, /\binvoice\b/i, /\bbilling\b/i,
    ],
  },
  {
    id: "automation",
    label: "Automation & Integrations",
    icon: "Workflow",
    color: "#84cc16",
    keywords: [
      /\bautomation\b/i, /\bautomate\b/i, /\bintegration\b/i,
      /\bzapier\b/i, /\bn8n\b/i, /\bmake\b/i, /\bworkflow\b/i,
      /\bslack\b/i, /\bdiscord\b/i, /\bzendesk\b/i, /\bhubspot\b/i,
      /\bsalesforce\b/i, /\bstripe\b/i, /\bpaypal\b/i, /\btwilio\b/i,
      /\bsendgrid\b/i,
    ],
  },
  {
    id: "meta-skills",
    label: "Meta (Skills & Cursor)",
    icon: "Settings",
    color: "#64748b",
    keywords: [
      /\bskill[- ](creator|share|build)/i, /\bwriting[- ]skills?\b/i,
      /\bcursor[- ](rules?|hooks?)\b/i, /\bsuggesting[- ]/i,
      /\bskill[- ]?creation\b/i, /\busing[- ]skills?\b/i,
      /\bmeta[- ]skill/i, /\bsubagent\b/i, /\bparallel[- ](agent|exploring)/i,
    ],
  },
  {
    id: "documentation",
    label: "Documentation",
    icon: "BookOpen",
    color: "#8b5a2b",
    keywords: [
      /\bdocumentation\b/i, /\bdocs?\b/i, /\bonboarding\b/i,
      /\bchangelog\b/i, /\breadme\b/i, /\barchitecture[- ]decision/i,
      /\badr\b/i,
    ],
  },
  {
    id: "blockchain",
    label: "Blockchain & Web3",
    icon: "Coins",
    color: "#fbbf24",
    keywords: [
      /\bblockchain\b/i, /\bweb3\b/i, /\bsolidity\b/i, /\bethereum\b/i,
      /\bsmart[- ]contract\b/i, /\bdefi\b/i, /\bnft\b/i, /\bwagmi\b/i,
      /\bviem\b/i,
    ],
  },
];

export const DEFAULT_DOMAIN = {
  id: "other",
  label: "Other",
  icon: "Box",
  color: "#94a3b8",
};

/**
 * Returns an array of matched domain ids for the given haystack text. Order
 * matches DOMAINS declaration order, so callers can use `tags[0]` as primary.
 * Falls back to ["other"] when nothing matches.
 */
export function classify(haystack) {
  const tags = [];
  for (const d of DOMAINS) {
    if (d.keywords.some((re) => re.test(haystack))) tags.push(d.id);
  }
  return tags.length ? tags : ["other"];
}

/**
 * Public-facing list of domains (without the regex internals) for the catalog
 * `domains` field consumed by the MCP and the Explorer UI.
 */
export function publicDomains() {
  return [...DOMAINS, DEFAULT_DOMAIN].map((d) => ({
    id: d.id,
    label: d.label,
    icon: d.icon,
    color: d.color,
  }));
}
