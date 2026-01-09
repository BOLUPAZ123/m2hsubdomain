import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground text-lg mb-12">
          Have questions? We're here to help. Reach out to us through any of the channels below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Email Support</h2>
            <p className="text-muted-foreground mb-4">
              For general inquiries, technical support, or account issues.
            </p>
            <Button asChild variant="outline">
              <a href="mailto:help@m2hgamerz.site">
                help@m2hgamerz.site
              </a>
            </Button>
          </div>

          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Response Time</h2>
            <p className="text-muted-foreground mb-4">
              We typically respond within 24-48 hours on business days.
            </p>
            <span className="text-sm text-muted-foreground">Monday - Friday</span>
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">How do I create a subdomain?</h3>
              <p className="text-muted-foreground text-sm">
                Sign up for a free account, go to your dashboard, and click "New Subdomain". 
                Enter your desired subdomain name and it will be created instantly.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">How many subdomains can I create?</h3>
              <p className="text-muted-foreground text-sm">
                Each user can create up to 5 subdomains.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">How do I point my subdomain to my website?</h3>
              <p className="text-muted-foreground text-sm">
                After creating your subdomain, click the settings icon to edit DNS records. 
                You can set an A record (IP address) or CNAME record (domain name) to point to your server.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Is SSL/HTTPS included?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! All subdomains have SSL enabled through Cloudflare proxy. HTTPS works automatically.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">How do I delete my account?</h3>
              <p className="text-muted-foreground text-sm">
                Contact us at help@m2hgamerz.site with your account email and we'll process your deletion request.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;