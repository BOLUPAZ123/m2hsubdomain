import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-foreground" />
              <span className="text-sm font-medium">M2H Domains</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Free subdomains for developers, hobbyists, and creators.
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="font-medium text-sm mb-4">Product</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
              <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              <Link to="/donate" className="hover:text-foreground transition-colors">Donate</Link>
            </nav>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-medium text-sm mb-4">Legal</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            </nav>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-medium text-sm mb-4">Support</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <a 
                href="mailto:help@m2hgamerz.site" 
                className="hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                help@m2hgamerz.site
              </a>
            </nav>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} M2H Domains. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
