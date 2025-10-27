import { Suspense } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ExternalLink, Lightbulb, Target, AlertTriangle, CheckCircle2, Link as LinkIcon, Shield, Server, Lock, Eye, FileWarning, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Security Journal - Lewis Perez",
  description: "Learning journey through AI Protector Workshop with mini projects and lessons learned",
}

interface MiniProject {
  week: number;
  title: string;
  status: 'completed' | 'in-progress' | 'planned';
  links?: Array<{ label: string; url: string }>;
  objectives: string[];
  lessonsLearned: string[];
  keyTakeaways?: string[];
  challenges?: string[];
}

const miniProjects: MiniProject[] = [
  {
    week: 1,
    title: "Protector Mindset & Secure Development Environment",
    status: 'completed',
    links: [
      { label: "Week 1 Curriculum", url: "https://aiagents.ausbizconsulting.com.au/ai-protector-workshop#week-1" },
      { label: "Australian Case Studies", url: "https://www.ausbizconsulting.com.au/courses/cybersec-bootcamp/curriculum/680672af77ffdbe1f1e742a1" },
      { label: "Security Journey LMS", url: "https://www.ausbizconsulting.com.au/courses/cybersec-bootcamp/curriculum/680672e077ffdbe1f1e742a2" }
    ],
    objectives: [
      "Understand the AI Protector role within the changing-roles framework",
      "Set up secure local development with Node.js, Git, VS Code, Copilot, and Claude Desktop",
      "Document environment hardening steps including extensions, policies, and secrets management",
      "Connect to existing MCP servers (Rolldice, Bootcamp Agent, Calendar Booking) and evaluate security baselines",
      "Collect Australian security case studies and LMS security journey insights for contextual awareness"
    ],
    lessonsLearned: [
      "Security must be considered from the very first commit, not as an afterthought",
      "Development environment security is foundational - compromised dev tools can lead to supply chain attacks",
      "MCP servers introduce new attack surfaces that require specific security assessments",
      "Australian data residency and privacy regulations (Privacy Act 1988) have specific implications for AI systems",
      "Claude Desktop and VS Code Copilot have different security and privacy models that must be understood"
    ],
    keyTakeaways: [
      "Shift-left security starts with securing the development environment itself",
      "Every MCP server connection should be evaluated for data handling, privacy, and security risks",
      "Understanding local case studies helps contextualize threats relevant to Australian organizations"
    ],
    challenges: [
      "Balancing developer productivity with security constraints",
      "Understanding the full scope of data that MCP servers can access",
      "Identifying which security controls are appropriate for different development scenarios"
    ]
  },
  {
    week: 2,
    title: "Cyber Security Bootcamp Integration & Digital Portfolio Foundation",
    status: 'in-progress',
    links: [
      { label: "Week 2 Curriculum", url: "https://aiagents.ausbizconsulting.com.au/ai-protector-workshop#week-2" },
      { label: "Cyber Security Bootcamp", url: "https://www.ausbizconsulting.com.au/courses/cybersec-bootcamp" }
    ],
    objectives: [
      "Integrate LMS video content from Cyber Security Bootcamp into learning journey",
      "Establish baseline security posture for digital portfolio application",
      "Review OWASP Top 10 in the context of AI-powered web applications",
      "Implement initial authentication and authorization patterns",
      "Document security decisions and rationale for portfolio foundation"
    ],
    lessonsLearned: [
      "Traditional web security principles (OWASP Top 10) still apply but need AI-specific adaptations",
      "Authentication for AI-powered applications requires considering both human and agent access patterns with Clerk.js",
      "Digital portfolios can be high-value targets due to professional information and contact details",
      "LMS integration provides structured learning path aligned with hands-on implementation",
      "Security documentation from day one creates an audit trail and learning reference",
      "Next.js 15 App Router provides enhanced security patterns with Server Components as secure-by-default",
      "Vercel Analytics and Speed Insights integration adds performance monitoring without compromising security"
    ],
    keyTakeaways: [
      "Foundation security decisions have cascading effects throughout the application lifecycle",
      "Combining theoretical LMS content with practical implementation reinforces learning",
      "Security patterns for Next.js applications differ from traditional server-rendered apps",
      "ClerkProvider setup in root layout enables role-based access control (RBAC) for admin routes",
      "Resource hints and DNS prefetching improve performance while maintaining security boundaries"
    ],
    challenges: [
      "Determining appropriate security level for a public portfolio vs. enterprise application",
      "Integrating multiple authentication providers (Clerk, OAuth) cohesively",
      "Balancing public accessibility with protection of sensitive admin functions"
    ]
  },
  {
    week: 3,
    title: "Secure the My Digital Portfolio Application",
    status: 'completed',
    links: [
      { label: "Week 3 Curriculum", url: "https://aiagents.ausbizconsulting.com.au/ai-protector-workshop#week-3" },
      { label: "Project Repository", url: "https://github.com/lewisperez999/v0-lewis-perez-portfolio-twin" },
      { label: "Live Portfolio", url: "https://www.lewisperez.dev" }
    ],
    objectives: [
      "Implement comprehensive security controls for Next.js portfolio application",
      "Configure Clerk authentication with role-based access control (RBAC)",
      "Secure API routes with proper authentication and rate limiting",
      "Implement Content Security Policy (CSP) and other security headers",
      "Secure database operations and prevent common injection attacks",
      "Set up environment variable management and secrets handling"
    ],
    lessonsLearned: [
      "✅ IMPLEMENTED: Edge middleware with Clerk authentication enforces RBAC at runtime='experimental-edge'",
      "✅ IMPLEMENTED: Arcjet SDK provides shield (XSS/SQL injection), bot detection, and token bucket rate limiting (20 tokens/10s, capacity 50)",
      "✅ IMPLEMENTED: PostgreSQL with pg-vector extension using parameterized queries prevents SQL injection",
      "✅ IMPLEMENTED: Clerk's publicMetadata.role='admin' enables flexible RBAC without custom auth tables",
      "✅ IMPLEMENTED: Environment variables managed securely (DATABASE_URL, ARCJET_KEY, CLERK secrets) with .env.local",
      "✅ IMPLEMENTED: Route matcher pattern protects /admin routes while allowing public access to /admin/sign-in",
      "✅ IMPLEMENTED: Custom error handling provides user-friendly messages without leaking system details",
      "✅ IMPLEMENTED: Connection pooling (max: 20 connections) with automatic client release prevents resource exhaustion",
      "Cache-Control headers set for public API routes: 'public, s-maxage=300, stale-while-revalidate=600'",
      "Performance optimization: DNS prefetching for api.openai.com, vercel.live, clerk.com reduces latency"
    ],
    keyTakeaways: [
      "Defense in depth achieved: Arcjet (application layer) + Clerk (authentication) + PostgreSQL (data layer) + Middleware (edge)",
      "Edge middleware with experimental-edge runtime provides global security enforcement with minimal latency",
      "Graceful degradation: Arcjet returns mock decision when not configured, enabling development without all keys",
      "Security monitoring via Vercel Analytics, Toaster notifications (sonner), and database health checks",
      "Suspense boundaries prevent security-sensitive content from streaming before auth checks complete"
    ],
    challenges: [
      "✅ SOLVED: CSP compatibility with Next.js - using Tailwind with custom properties and system theme detection",
      "✅ SOLVED: Rate limiting balance - Arcjet token bucket with refillRate: 20 allows normal usage while blocking abuse",
      "✅ SOLVED: Secret management - Vercel environment variables with separate dev/staging/production contexts",
      "✅ SOLVED: Admin route protection - createRouteMatcher with isAdminRoute and isPublicRoute patterns",
      "ONGOING: Performance vs security tradeoff - monitoring s-maxage cache effectiveness with Speed Insights"
    ]
  }
];

const upcomingWeeks: MiniProject[] = [
  {
    week: 4,
    title: "Layered Defenses: WAF, Arcjet, and Vercel Firewall",
    status: 'in-progress',
    links: [
      { label: "Week 4 Curriculum", url: "https://aiagents.ausbizconsulting.com.au/ai-protector-workshop#week-4" },
      { label: "Arcjet Documentation", url: "https://docs.arcjet.com/" },
      { label: "Vercel Firewall Docs", url: "https://vercel.com/docs/security/firewall" }
    ],
    objectives: [
      "Configure Vercel Firewall for edge protection",
      "Integrate Arcjet SDK for AI-aware rate limiting and bot protection",
      "Implement Web Application Firewall (WAF) rules",
      "Set up DDoS protection and monitoring",
      "Test and tune firewall rules with real traffic patterns"
    ],
    lessonsLearned: [
      "✅ IMPLEMENTED: Arcjet shield in 'LIVE' mode blocks SQL injection and XSS attacks at application layer",
      "✅ IMPLEMENTED: Bot detection allows SEARCH_ENGINE, MONITOR, and PREVIEW categories while blocking malicious bots",
      "✅ IMPLEMENTED: Token bucket rate limiting with characteristics=['ip.src'] prevents per-IP abuse",
      "✅ IMPLEMENTED: checkArcjetProtection() helper function used across /api/mcp and /api/contact routes",
      "Vercel Firewall provides edge-level DDoS protection and geographic filtering (regions: ['pdx1'])",
      "Multi-layer defense: Vercel Edge → Arcjet Application → Clerk Auth → Database validates defense-in-depth principle"
    ],
    keyTakeaways: [
      "Arcjet's 'DRY_RUN' mode enables testing rules before enforcement in production",
      "Bot detection must balance security (blocking scrapers) with functionality (allowing search engines)",
      "Rate limit tuning requires analytics: 20 tokens/10s allows ~120 requests/minute per IP",
      "Graceful degradation with mock decisions ensures development continues without all API keys"
    ],
    challenges: [
      "Tuning rate limits to prevent false positives for power users while blocking abuse",
      "Determining appropriate bot allow-list categories for SEO vs security tradeoff",
      "Testing firewall rules without blocking legitimate traffic during deployment"
    ]
  },
  {
    week: 5,
    title: "Kali Linux Penetration Testing Sprint",
    status: 'planned',
    objectives: [
      "Set up Kali Linux environment for security testing",
      "Perform reconnaissance and vulnerability scanning with nmap, nikto, and dirb",
      "Test rate limits with automated tools (Apache Bench, siege)",
      "Attempt SQL injection against hardened database endpoints using sqlmap",
      "Test XSS protection with XSS Hunter and manual payload injection",
      "Attempt authentication bypass and session hijacking attacks",
      "Document findings in professional penetration testing report format"
    ],
    lessonsLearned: [],
    keyTakeaways: [],
    challenges: [
      "Establishing legal and ethical boundaries for penetration testing on live production site",
      "Distinguishing between legitimate security testing and actual attacks in logs",
      "Documenting remediation steps without exposing vulnerabilities publicly"
    ]
  },
  {
    week: 6,
    title: "Prerequisites for Agent Security Advanced",
    status: 'in-progress',
    links: [
      { label: "Week 6 Curriculum", url: "https://aiagents.ausbizconsulting.com.au/ai-protector-workshop#week-6" },
      { label: "MCP Protocol Docs", url: "https://modelcontextprotocol.io/" },
      { label: "OAuth 2.1 Spec", url: "https://oauth.net/2.1/" }
    ],
    objectives: [
      "Review OAuth 2.1 and OpenID Connect specifications",
      "Understand MCP authentication requirements and security model",
      "Prepare environment for secure MCP server development",
      "Study mcp-auth-demo reference implementation",
      "Analyze existing MCP tools in portfolio for security gaps"
    ],
    lessonsLearned: [
      "✅ IMPLEMENTED: MCP server with 15+ tools providing professional data access (get_experiences, lookup_skills, query_projects)",
      "✅ IMPLEMENTED: MCP tools use semantic search with vector embeddings for intelligent content retrieval",
      "✅ IMPLEMENTED: Arcjet protection applied to /api/mcp endpoint prevents abuse of MCP tools",
      "MCP protocol enables Claude Desktop, ChatGPT Developer Mode, and VS Code Copilot to access portfolio data",
      "Current MCP implementation lacks OAuth - tools are protected by Arcjet rate limiting only",
      "Model Context Protocol standardizes how AI agents access external data sources and APIs",
      "Vector search with pg-vector (1536-dimensional embeddings) powers semantic search across professional content"
    ],
    keyTakeaways: [
      "MCP security requires authentication, authorization, and audit logging for production deployment",
      "Current MCP tools demonstrate capability but need OAuth 2.1 upgrade for enterprise security",
      "Semantic search via vector embeddings enables natural language queries across professional content",
      "MCP integration in portfolio showcases cutting-edge AI agent communication standards"
    ],
    challenges: [
      "Balancing open access for portfolio visitors with secure API access for MCP clients",
      "Implementing OAuth 2.1 without breaking existing Claude Desktop integration",
      "Determining appropriate scopes and permissions for different MCP tool categories"
    ]
  },
  {
    week: 7,
    title: "Agent Security Advanced Phase 1 & MCP Auth Demo",
    status: 'planned',
    links: [
      { label: "Week 7 Curriculum", url: "https://aiagents.ausbizconsulting.com.au/ai-protector-workshop#week-7" },
      { label: "mcp-auth-demo", url: "https://github.com/modelcontextprotocol/mcp-auth-demo" }
    ],
    objectives: [
      "Implement OAuth 2.1 authentication for MCP servers",
      "Integrate mcp-auth-demo patterns into existing MCP implementation",
      "Create authorization server for MCP client authentication",
      "Secure MCP server endpoints with token validation",
      "Test authentication flows with Claude Desktop and other MCP clients",
      "Implement scope-based access control for different MCP tools"
    ],
    lessonsLearned: [],
    keyTakeaways: [],
    challenges: [
      "Maintaining backward compatibility with existing non-authenticated MCP clients",
      "Implementing token refresh flows for long-running AI agent sessions",
      "Debugging OAuth flows across multiple MCP client platforms"
    ]
  },
  {
    week: 8,
    title: "Agent Security Advanced Phase 2 & Production Hardening",
    status: 'planned',
    objectives: [
      "Complete Agent Security Advanced curriculum",
      "Implement production security hardening",
      "Set up monitoring and alerting",
      "Create incident response procedures"
    ],
    lessonsLearned: [],
    keyTakeaways: []
  },
  {
    week: 9,
    title: "Portfolio Integration & Security Reporting",
    status: 'planned',
    objectives: [
      "Integrate security features into portfolio showcase",
      "Create executive security reports",
      "Document security architecture and decisions",
      "Prepare compliance documentation"
    ],
    lessonsLearned: [],
    keyTakeaways: []
  },
  {
    week: 10,
    title: "Final Presentation & Protector Launch Plan",
    status: 'planned',
    objectives: [
      "Complete final portfolio presentation",
      "Deliver security playbooks and runbooks",
      "Present executive briefing",
      "Launch as AI Protector specialist"
    ],
    lessonsLearned: [],
    keyTakeaways: []
  }
];

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    case 'in-progress':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
    case 'planned':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
  }
}

function ProjectCard({ project }: { project: MiniProject }) {
  return (
    <Card className="h-full hover-glow glow-secondary transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono">Week {project.week}</Badge>
              <Badge className={getStatusColor(project.status)}>
                {project.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {project.status.replace('-', ' ')}
              </Badge>
            </div>
            <CardTitle className="text-lg">{project.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Links */}
        {project.links && project.links.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <LinkIcon className="w-4 h-4" />
              Resources
            </div>
            <div className="space-y-1">
              {project.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Objectives */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Target className="w-4 h-4" />
            Objectives
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {project.objectives.map((objective, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lessons Learned */}
        {project.lessonsLearned.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Lightbulb className="w-4 h-4" />
              Lessons Learned
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {project.lessonsLearned.map((lesson, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">→</span>
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Takeaways */}
        {project.keyTakeaways && project.keyTakeaways.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <CheckCircle2 className="w-4 h-4" />
              Key Takeaways
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {project.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Challenges */}
        {project.challenges && project.challenges.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <AlertTriangle className="w-4 h-4" />
              Challenges
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {project.challenges.map((challenge, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">⚠</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SecurityJournalPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10 animate-gradient-shift"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-cyan-400/15 to-blue-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="mb-4 hover-glow">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4 animate-fade-in">
            <BookOpen className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text-animated">Security Journal</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Learning journey through the AI Protector Workshop - documenting each LMS mini project, 
            implementation details, and lessons learned from securing AI-powered applications.
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Badge variant="outline" className="text-sm">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {miniProjects.filter(p => p.status === 'completed').length} Completed
            </Badge>
            <Badge variant="outline" className="text-sm">
              {miniProjects.filter(p => p.status === 'in-progress').length} In Progress
            </Badge>
            <Badge variant="outline" className="text-sm">
              {upcomingWeeks.length} Upcoming
            </Badge>
          </div>
        </div>
      </section>

      {/* Current Progress */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-8">Current Progress</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {miniProjects.map((project) => (
              <ProjectCard key={project.week} project={project} />
            ))}
          </div>

          {/* Upcoming Weeks */}
          <h2 className="text-3xl font-bold mb-8">Upcoming Weeks</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {upcomingWeeks.map((project) => (
              <ProjectCard key={project.week} project={project} />
            ))}
          </div>

          {/* Overall Learning Insights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                Implemented Security Features in This Portfolio
              </CardTitle>
              <CardDescription>Real-world security implementations demonstrating AI Protector concepts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    Authentication & Authorization
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Clerk.js Integration:</strong> Enterprise authentication with RBAC using publicMetadata.role</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Edge Middleware:</strong> clerkMiddleware with experimental-edge runtime for global auth enforcement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Route Protection:</strong> createRouteMatcher pattern protects /admin/* routes dynamically</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    Application Security (Arcjet)
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Shield Protection:</strong> LIVE mode blocks SQL injection, XSS, and common web attacks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Bot Detection:</strong> Allows search engines/monitors while blocking malicious bots</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Rate Limiting:</strong> Token bucket (20/10s refill, 50 capacity) per IP address</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4 text-orange-500" />
                    Database Security
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>PostgreSQL + pg-vector:</strong> Parameterized queries prevent SQL injection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Connection Pooling:</strong> Max 20 connections, 30s idle timeout, automatic release</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Transaction Safety:</strong> BEGIN/COMMIT/ROLLBACK with automatic error handling</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-500" />
                    MCP Security & AI Integration
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>MCP Protocol:</strong> Standardized AI agent access with 15+ professional data tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Arcjet on /api/mcp:</strong> Rate limiting and shield protection for MCP endpoints</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span><strong>OAuth 2.1 (Planned):</strong> Week 7-8 implementation for enterprise MCP security</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-500" />
                    Monitoring & Performance
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Vercel Analytics:</strong> Real-time traffic monitoring and performance metrics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Speed Insights:</strong> Core Web Vitals tracking for performance optimization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Health Checks:</strong> Database connectivity monitoring with response time alerts</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileWarning className="w-4 h-4 text-indigo-500" />
                    Deployment Security
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Environment Isolation:</strong> Separate dev/staging/production secrets management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Vercel Edge Network:</strong> Global CDN with DDoS protection (region: pdx1)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>SSL/TLS:</strong> Automatic HTTPS with production SSL certificate on custom domain</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-semibold mb-2 text-sm">🎯 Security Metrics Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Rate Limit</div>
                    <div className="font-mono font-semibold">20 req/10s</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">DB Pool</div>
                    <div className="font-mono font-semibold">20 max conn</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Cache TTL</div>
                    <div className="font-mono font-semibold">300s + SWR</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Edge Runtime</div>
                    <div className="font-mono font-semibold">&lt;50ms global</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Learning Insights */}
          <Card className="hover-glow glow-secondary transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                Overall Learning Insights
              </CardTitle>
              <CardDescription>Key themes emerging from the AI Protector journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">🛡️ Security as a Mindset</h3>
                  <p className="text-sm text-muted-foreground">
                    The AI Protector role is not just about implementing security controls, but about developing 
                    a security-first mindset that questions assumptions, considers threat models, and evaluates 
                    risks at every stage of development. This portfolio demonstrates security integrated from the first commit.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🔐 Layered Defense Strategy (Defense in Depth)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    No single security control is sufficient. This project implements defense in depth with 
                    multiple overlapping controls:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li><strong>Edge Layer:</strong> Vercel Firewall with DDoS protection and geographic filtering</li>
                    <li><strong>Application Layer:</strong> Arcjet SDK with shield (XSS/SQL injection), bot detection, and rate limiting</li>
                    <li><strong>Authentication Layer:</strong> Clerk.js with RBAC enforced via edge middleware</li>
                    <li><strong>Data Layer:</strong> PostgreSQL with parameterized queries, connection pooling, and transaction safety</li>
                    <li><strong>Monitoring Layer:</strong> Vercel Analytics, Speed Insights, and custom health checks</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🎯 Context-Aware Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Security requirements vary based on context. This portfolio balances public accessibility 
                    (portfolio sections) with protected resources (admin dashboard, MCP tools). Route-based 
                    middleware enables granular security policies matching the sensitivity of each endpoint.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">📊 Implemented Security Metrics</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Real-world security measurements from this production portfolio:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li><strong>Rate Limiting:</strong> Token bucket with 20 tokens/10s refill, 50 capacity per IP</li>
                    <li><strong>Database Performance:</strong> Connection pool max 20, 30s idle timeout, 10s connection timeout</li>
                    <li><strong>Cache Strategy:</strong> Public API routes with s-maxage=300, stale-while-revalidate=600</li>
                    <li><strong>Edge Runtime:</strong> experimental-edge for global middleware execution &lt;50ms</li>
                    <li><strong>Vector Search:</strong> 1536-dimensional embeddings with cosine similarity for semantic security</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">📚 Documentation as Security Asset</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive documentation of security decisions, configurations, and rationale creates 
                    an audit trail, facilitates compliance, and serves as a learning resource. This security journal 
                    itself demonstrates the practice of documenting security implementations with specific metrics, 
                    lessons learned, and challenges overcome.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🚀 Production-Ready Security Stack</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    This portfolio showcases enterprise-grade security patterns suitable for production AI applications:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>✅ Authentication & RBAC with Clerk (admin role in publicMetadata)</li>
                    <li>✅ Edge middleware with route-based protection (experimental-edge runtime)</li>
                    <li>✅ Application firewall with Arcjet (shield, bot detection, rate limiting)</li>
                    <li>✅ Secure database operations (parameterized queries, connection pooling, transactions)</li>
                    <li>✅ Environment variable management (separation of dev/staging/production)</li>
                    <li>✅ MCP protocol integration with security controls (Arcjet on /api/mcp)</li>
                    <li>✅ Performance monitoring (Vercel Analytics, Speed Insights, database health checks)</li>
                    <li>🔄 OAuth 2.1 for MCP servers (planned Week 7-8 implementation)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
