import { Globe, Zap, Shield, Settings, Clock, Users } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Unlimited Subdomains",
    description: "Create as many subdomains as you need. No artificial limits or premium tiers.",
  },
  {
    icon: Zap,
    title: "Instant Propagation",
    description: "DNS changes go live in seconds, not hours. Powered by Cloudflare's global network.",
  },
  {
    icon: Shield,
    title: "DDoS Protection",
    description: "Every subdomain is protected by Cloudflare's enterprise-grade security.",
  },
  {
    icon: Settings,
    title: "Full DNS Control",
    description: "Configure A records, CNAME records, and proxy settings through a simple interface.",
  },
  {
    icon: Clock,
    title: "Always Available",
    description: "99.9% uptime guaranteed. Your subdomains stay online when you need them.",
  },
  {
    icon: Users,
    title: "Community Supported",
    description: "Open and free for everyone. Optional donations keep the service running.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Simple, powerful features to get your subdomain up and running in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-6 hover-lift"
            >
              <feature.icon className="h-5 w-5 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
