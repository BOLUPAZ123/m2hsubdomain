import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 9, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using M2H Domains ("Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              M2H Domains provides free subdomain registration under the m2hgamerz.site domain. Users can create 
              subdomains, configure DNS records, and manage their domains through our dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              To use our Service, you must create an account with a valid email address. You are responsible 
              for maintaining the security of your account and all activities that occur under it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You agree NOT to use the Service for:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Illegal activities or promoting illegal content</li>
              <li>Spam, phishing, or malware distribution</li>
              <li>Impersonation or fraud</li>
              <li>Content that violates intellectual property rights</li>
              <li>Adult, violent, or hateful content</li>
              <li>Any activity that disrupts or harms other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subdomain Limits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Each user is limited to 5 subdomains total. We reserve the right to modify these limits at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Content and Moderation</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to disable or delete any subdomain that violates these terms without prior 
              notice. Repeat violations may result in account termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to provide reliable service but do not guarantee 100% uptime. The Service is provided 
              "as is" without warranties of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Donations</h2>
            <p className="text-muted-foreground leading-relaxed">
              Donations are voluntary and non-refundable. Donating does not grant special privileges or 
              guarantee service availability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms at any time. Continued use of the Service after changes constitutes 
              acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these terms, contact us at{" "}
              <a href="mailto:help@m2hgamerz.site" className="text-foreground hover:underline">
                help@m2hgamerz.site
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;