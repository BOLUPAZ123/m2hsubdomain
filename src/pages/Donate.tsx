import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Loader2, CheckCircle2, XCircle, ArrowLeft, AlertCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useDonation } from "@/hooks/useDonation";
import { toast } from "sonner";

declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => {
      checkout: (opts: {
        paymentSessionId: string;
        redirectTarget?: "_self" | "_blank" | "_top" | "_modal" | HTMLElement;
      }) => Promise<unknown>;
    };
  }
}

const presetAmounts = [100, 250, 500, 1000];

const Donate = () => {
  const { profile } = useAuth();
  const { createDonation, verifyPayment, isProcessing } = useDonation();
  const [searchParams] = useSearchParams();

  const [customAmount, setCustomAmount] = useState("");
  const [amount, setAmount] = useState(250);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");
  const [cashfreeReady, setCashfreeReady] = useState(false);

  useEffect(() => {
    // Load Cashfree JS SDK (required for redirect/popup/inline checkout)
    const existing = document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]');
    if (existing) {
      setCashfreeReady(typeof window.Cashfree === "function");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => setCashfreeReady(typeof window.Cashfree === "function");
    script.onerror = () => setCashfreeReady(false);
    document.body.appendChild(script);

    return () => {
      // keep script cached; do not remove
    };
  }, []);

  useEffect(() => {
    const orderId = searchParams.get("order_id");

    // Always verify with backend when returning from payment
    if (orderId) {
      verifyPayment(orderId).then((result) => {
        if (result.success && result.status === "success") {
          setPaymentStatus("success");
        } else if (result.success && result.status === "pending") {
          // Still pending, keep checking or show pending state
          setPaymentStatus("idle");
          toast.info("Payment is being processed...");
        } else {
          setPaymentStatus("failed");
        }
      });
    }
  }, [searchParams, verifyPayment]);

  const handlePresetClick = (preset: number) => {
    setAmount(preset);
    setCustomAmount("");
    setError(null);
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    const num = parseInt(value);
    if (num && num >= 10) {
      setAmount(num);
      setError(null);
    } else if (value && num < 10) {
      setError("Minimum amount is ₹10");
    }
  };

  const handleDonate = async () => {
    if (amount < 10) {
      setError("Minimum amount is ₹10");
      return;
    }

    if (!cashfreeReady) {
      toast.error("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    const result = await createDonation(amount, "INR", profile?.email, profile?.name);

    if (result.success && result.paymentSessionId) {
      try {
        const cashfree = window.Cashfree?.({ mode: result.isProduction ? "production" : "sandbox" });
        if (!cashfree) throw new Error("Cashfree SDK not available");

        // Redirect checkout (avoids iframe issues like “sandbox.cashfree.com refused to connect”)
        await cashfree.checkout({ paymentSessionId: result.paymentSessionId, redirectTarget: "_self" });
      } catch (e: any) {
        toast.error(e?.message || "Failed to open payment page");
      }
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4 pt-20">
          <div className="text-center">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
            <p className="text-muted-foreground mb-6">Your donation helps keep M2H Domains free.</p>
            <Link to="/dashboard">
              <Button variant="hero">Go to Dashboard</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4 pt-20">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
            <Button variant="hero" onClick={() => setPaymentStatus("idle")}>Try Again</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                <Heart className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Support M2H Domains</h1>
                <p className="text-sm text-muted-foreground">Help keep the service free</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm mb-3 block">Select amount (INR)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handlePresetClick(preset)}
                      className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                        amount === preset && !customAmount
                          ? "bg-foreground text-background border-foreground"
                          : "bg-secondary border-border hover:bg-accent"
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Or enter custom amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    className="pl-7"
                    min={10}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button 
                variant="hero" 
                className="w-full" 
                onClick={handleDonate}
                disabled={isProcessing || amount < 10}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    Donate ₹{amount}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Donations processed securely via Cashfree.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Donate;
