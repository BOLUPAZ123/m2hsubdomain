import { Link } from "react-router-dom";
import { Mail, Github, Twitter, Globe2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <Globe2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">M2H SubDomains</span>
                <span className="text-[10px] text-muted-foreground">Free DNS Hosting</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Free subdomains for developers, hobbyists, and creators. Powered by Cloudflare.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="mailto:help@m2hgamerz.site" 
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
              <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              <Link to="/donate" className="hover:text-foreground transition-colors">Donate</Link>
            </nav>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            </nav>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Support</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link>
              <a 
                href="mailto:help@m2hgamerz.site" 
                className="hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Mail className="h-3.5 w-3.5" />
                help@m2hgamerz.site
              </a>
            </nav>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} M2H SubDomains. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
