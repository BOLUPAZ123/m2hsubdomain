import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-foreground" />
            <span className="text-sm font-medium">M2H Domains</span>
          </div>
          
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
            <Link to="/donate" className="hover:text-foreground transition-colors">Donate</Link>
            <a href="mailto:support@m2hgamerz.site" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} M2H Domains
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
