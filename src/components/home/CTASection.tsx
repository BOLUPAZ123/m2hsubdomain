import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-28 border-t border-border relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
            Create your free subdomain in less than a minute. 
            No credit card required. No hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="hero" size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/20">
                Get Your Free Subdomain
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/donate">
              <Button variant="outline" size="lg" className="text-base px-8 h-12">
                <Heart className="h-4 w-4 mr-2 text-destructive" />
                Support Us
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground mt-8">
            Questions? Reach out to{" "}
            <a href="mailto:help@m2hgamerz.site" className="text-primary hover:underline">
              help@m2hgamerz.site
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
