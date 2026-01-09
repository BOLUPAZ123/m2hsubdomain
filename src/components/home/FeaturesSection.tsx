import { Globe, Zap, Shield, Settings, Clock, Users, Sparkles, Lock } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Unlimited Subdomains",
    description: "Create as many subdomains as you need. No artificial limits or premium tiers.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Zap,
    title: "Instant Propagation",
    description: "DNS changes go live in seconds, not hours. Powered by Cloudflare's global network.",
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
  {
    icon: Shield,
    title: "DDoS Protection",
    description: "Every subdomain is protected by Cloudflare's enterprise-grade security.",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Settings,
    title: "Full DNS Control",
    description: "Configure A records, CNAME records, and proxy settings through a simple interface.",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Clock,
    title: "Always Available",
    description: "99.9% uptime guaranteed. Your subdomains stay online when you need them.",
    gradient: "from-red-500/20 to-rose-500/20",
  },
  {
    icon: Users,
    title: "Community Supported",
    description: "Open and free for everyone. Optional donations keep the service running.",
    gradient: "from-indigo-500/20 to-violet-500/20",
  },
  {
    icon: Sparkles,
    title: "Custom Landing Pages",
    description: "Set up redirects or custom HTML landing pages for your subdomains.",
    gradient: "from-teal-500/20 to-cyan-500/20",
  },
  {
    icon: Lock,
    title: "SSL Included",
    description: "All subdomains come with automatic SSL certificates via Cloudflare.",
    gradient: "from-amber-500/20 to-yellow-500/20",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-28 border-t border-border relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Powerful Features</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Simple, powerful features to get your subdomain up and running in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card gradient-border p-6 hover-lift group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
