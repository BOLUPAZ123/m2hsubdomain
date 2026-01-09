import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Globe, Zap, Shield, Server, Lock, Heart, 
  ArrowRight, Check, Cloud, RefreshCw, Clock
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Globe,
    title: "Unlimited Free Subdomains",
    description: "Create as many subdomains as you need under cashurl.shop. No limits, no hidden fees, forever free.",
    details: ["No registration fees", "No renewal costs", "No domain limits"]
  },
  {
    icon: Zap,
    title: "Instant DNS Propagation",
    description: "Your DNS records are live within seconds thanks to Cloudflare's global edge network.",
    details: ["Sub-second propagation", "280+ global locations", "99.99% uptime SLA"]
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Optional Cloudflare proxy provides DDoS protection, SSL/TLS encryption, and WAF.",
    details: ["Free SSL certificates", "DDoS mitigation", "Web Application Firewall"]
  },
  {
    icon: Server,
    title: "Full DNS Control",
    description: "Support for A and CNAME records. Point your subdomain to any IP address or domain.",
    details: ["A records for IPs", "CNAME for domains", "Proxy toggle"]
  },
  {
    icon: Lock,
    title: "Abuse Protection",
    description: "Built-in rate limiting, keyword filtering, and admin moderation to prevent misuse.",
    details: ["Rate limiting", "Reserved name blocking", "Admin oversight"]
  },
  {
    icon: Heart,
    title: "Community Funded",
    description: "No subscriptions or paywalls. The platform runs on optional community donations.",
    details: ["Optional donations", "Transparent funding", "Community-driven"]
  }
];

const steps = [
  { step: 1, title: "Create Account", description: "Sign up with your email in seconds" },
  { step: 2, title: "Choose Subdomain", description: "Pick your unique subdomain name" },
  { step: 3, title: "Configure DNS", description: "Set up A or CNAME records" },
  { step: 4, title: "Go Live!", description: "Your subdomain is active instantly" },
];

const Features = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden hero-gradient">
          <div className="hero-glow" />
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Everything You Need, <span className="gradient-text">Nothing You Don't</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                CashURL provides powerful subdomain hosting with enterprise-grade features, 
                completely free. No tricks, no paywalls.
              </p>
              <Link to="/register">
                <Button variant="hero" size="lg">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="glass-card p-6 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-card/50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It <span className="gradient-text">Works</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Get your free subdomain up and running in under a minute
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {steps.map((item, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-border">
                      <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="glass-card p-8 md:p-12 max-w-3xl mx-auto text-center glow-effect">
              <Cloud className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of users enjoying free subdomains. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button variant="hero" size="lg">
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/donate">
                  <Button variant="outline" size="lg">
                    <Heart className="h-4 w-4" />
                    Support the Project
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Features;