import { Suspense } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Eye, Server, FileWarning, CheckCircle2, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Security Plan - Lewis Perez",
  description: "Upcoming security controls and implementation roadmap for AI-powered portfolio",
}

export default function SecurityPlanPage() {
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
            <Shield className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text-animated">Security Plan</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Comprehensive security controls and implementation roadmap following the AI Protector Workshop curriculum
          </p>
        </div>
      </section>

      {/* Program Overview */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <Card className="mb-8 hover-glow glow-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-6 h-6" />
                AI Protector Workshop Overview
              </CardTitle>
              <CardDescription>10-week security-first journey from development to production</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                A comprehensive program training builders and security engineers to defend AI-powered applications. 
                Securing AI agent infrastructure from first commit through production deployment using layered defenses 
                covering MCP servers, digital twins, serverless platforms, and Vercel edge services.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">10 Weeks</div>
                  <div className="text-sm text-muted-foreground">Comprehensive Program</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">3 Cycles</div>
                  <div className="text-sm text-muted-foreground">Layered Security</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">Hands-on</div>
                  <div className="text-sm text-muted-foreground">Video Support Learning</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Three Progressive Cycles */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Three Progressive Cycles</h2>
            
            {/* Cycle 1: Weeks 1-3 */}
            <Card className="mb-6 hover-glow glow-primary transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>Cycle 1: Security Foundations</CardTitle>
                  <Badge variant="outline">Weeks 1-3</Badge>
                </div>
                <CardDescription>Protector Mindset, Secure Digital Portfolio, and LMS Integration</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Establish the AI Protector mindset, secure development workstation, and align with Cyber Security Bootcamp learning paths. 
                  Harden digital portfolio from the beginning while integrating LMS video tutorials and Australian case studies.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Week 1:</strong> Protector Mindset & Secure Development Environment
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Week 2:</strong> Cyber Security Bootcamp Integration & Digital Portfolio Foundation
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Week 3:</strong> Secure the My Digital Portfolio Application
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cycle 2: Weeks 4-6 */}
            <Card className="mb-6 hover-glow glow-secondary transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>Cycle 2: Defensive & Offensive Operations</CardTitle>
                  <Badge variant="outline">Weeks 4-6</Badge>
                </div>
                <CardDescription>WAF, Arcjet, and Kali Linux Penetration Testing</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Layer WAF protections onto digital portfolio, integrate Arcjet for agent-aware shielding, 
                  and run offensive security sprints with Kali Linux to understand attacker perspectives and hardening strategies.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Week 4:</strong> Layered Defenses: WAF, Arcjet, and Vercel Firewall (Optional Sprint)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Week 5:</strong> Kali Linux Penetration Testing Sprint
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Week 6:</strong> Prerequisites for Agent Security Advanced
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cycle 3: Weeks 7-10 */}
            <Card className="mb-6 hover-glow glow-accent transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>Cycle 3: Advanced Agent Security & Professional Delivery</CardTitle>
                  <Badge variant="outline">Weeks 7-10</Badge>
                </div>
                <CardDescription>OAuth-secured MCP, Agent Security Advanced, and Executive Reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Implement the full Agent Security Advanced curriculum, secure MCP servers with OAuth 2.1, 
                  integrate the mcp-auth-demo, and deliver final portfolio presentations complete with security playbooks and executive insights.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Week 7:</strong> Agent Security Advanced Phase 1 & MCP Auth Demo
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Week 8:</strong> Agent Security Advanced Phase 2 & Production Hardening
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Week 9:</strong> Portfolio Integration & Security Reporting
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Week 10:</strong> Final Presentation & Protector Launch Plan
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Learning Areas */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Key Learning Areas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover-glow glow-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Secure AI Development Lifecycle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Shift-left security practices, secure coding standards, and environment hardening for AI agents
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-glow glow-secondary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Cyber Security Bootcamp Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    LMS-backed curriculum covering penetration testing, threat detection, and incident readiness
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-glow glow-accent transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    MCP Security Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    OAuth 2.1 authentication, Arcjet firewall integration, and secure MCP server deployment
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-glow glow-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileWarning className="w-5 h-5" />
                    Web Application Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Hardened Next.js digital portfolio with Vercel Firewall, Clerk auth, and custom domain protections
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-glow glow-secondary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Offensive Security Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Kali Linux tooling, rate limit evaluation, brute-force testing, and SQL injection mitigation
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-glow glow-accent transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Professional Reporting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Executive dashboards, compliance mapping, and portfolio-ready security documentation
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Program Outcomes */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Expected Program Outcomes</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="hover-glow glow-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Secure AI Portfolio Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Hardened digital portfolio with WAF, Vercel Firewall, Arcjet, and monitored MCP integrations
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-glow glow-secondary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Penetration Testing Playbook</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Documented Kali Linux workflows with repeatable test cases for AI agent attack surfaces
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-glow glow-accent transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">MCP Authentication Mastery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    OAuth 2.1 secured MCP server based on the mcp-auth-demo template and Agent Security Advanced patterns
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-glow glow-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Compliance-Ready Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Security journey reports, Australian case studies analysis, and executive briefings
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-glow glow-secondary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Operational Runbooks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Incident response procedures, rate limit thresholds, and ongoing security automation scripts
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-glow glow-accent transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Career Acceleration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Protector mindset, presentation-ready portfolio, and cyber security specialization for AI agents
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Resources */}
          <Card className="hover-glow glow-primary transition-all duration-300">
            <CardHeader>
              <CardTitle>External Resources</CardTitle>
              <CardDescription>Learn more about the AI Protector Workshop</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <a 
                  href="https://aiagents.ausbizconsulting.com.au/ai-protector-workshop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="font-semibold text-primary">AI Protector Workshop</div>
                  <div className="text-sm text-muted-foreground">Official workshop curriculum and materials</div>
                </a>
                <a 
                  href="https://modelcontextprotocol.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="font-semibold text-primary">Model Context Protocol</div>
                  <div className="text-sm text-muted-foreground">Official MCP documentation and specifications</div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
