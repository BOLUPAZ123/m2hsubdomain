import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Check, Globe, Coffee, Gift, Rocket, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useDonation } from "@/hooks/useDonation";
import { toast } from "sonner";

const presetAmounts = [
  { value: 100, label: "₹100", icon: Coffee, description: "Buy us a coffee" },
  { value: 500, label: "₹500", icon: Gift, description: "Support the cause" },
  { value: 1000, label: "₹1000", icon: Heart, description: "Make a difference" },
  { value: 2500, label: "₹2500", icon: Rocket, description: "Power supporter" },
];

const Donate = () => {
  const { profile } = useAuth();
  const { createDonation, verifyPayment, isProcessing } = useDonation();
  const [searchParams] = useSearchParams();
  
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(500);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");

  // Check for payment return
  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const status = searchParams.get("status");
    
    if (orderId && status) {
      if (status === "PAID") {
        setPaymentStatus("success");
        verifyPayment(orderId);
      } else {
        setPaymentStatus("failed");
      }
    }
  }, [searchParams, verifyPayment]);

  const handlePresetClick = (value: number) => {
    setSelectedPreset(value);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedPreset(0);
  };

  const currentAmount = customAmount ? parseFloat(customAmount) : selectedPreset;
  const isValidAmount = currentAmount >= 1;

  const handleDonate = async () => {
    if (!isValidAmount) {
      toast.error("Minimum donation is ₹1");
      return;
    }

    const result = await createDonation(
      currentAmount,
      "INR",
      profile?.email,
      profile?.name
    );

    if (result.success && result.paymentSessionId) {
      // Redirect to Cashfree payment page
      // In production, you would use the Cashfree SDK to open the payment modal
      toast.info("Redirecting to payment gateway...");
      
      // For sandbox testing, you can use this URL format
      // In production, use the Cashfree JS SDK
      window.location.href = `https://sandbox.cashfree.com/pg/view/payment?order_id=${result.orderId}`;
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24 pb-12">
          <div className="text-center animate-slide-up">
            <CheckCircle2 className="h-20 w-20 text-success mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Thank You! 💚</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your generous donation helps keep M2HGamerz running and free for everyone.
            </p>
            <Link to="/dashboard">
              <Button variant="hero" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24 pb-12">
          <div className="text-center animate-slide-up">
            <XCircle className="h-20 w-20 text-destructive mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Something went wrong with your payment. Please try again.
            </p>
            <Button variant="hero" size="lg" onClick={() => setPaymentStatus("idle")}>
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="hero-glow" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Support <span className="gradient-text">M2HGamerz</span>
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your donation helps keep this platform free for everyone. 
                Every contribution, big or small, makes a difference.
              </p>
            </div>

            {/* Donation Card */}
            <div className="glass-card p-8">
              {/* Preset Amounts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetClick(preset.value)}
                    className={`p-4 rounded-lg border transition-all duration-200 text-center ${
                      selectedPreset === preset.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-secondary/30"
                    }`}
                  >
                    <preset.icon className={`h-6 w-6 mx-auto mb-2 ${selectedPreset === preset.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="font-bold">{preset.label}</div>
                    <div className="text-xs text-muted-foreground">{preset.description}</div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="custom">Custom Amount (INR)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="custom"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={handleCustomChange}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimum donation: ₹1</p>
              </div>

              {/* Summary */}
              {isValidAmount && (
                <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Donation Amount</span>
                    <span className="text-2xl font-bold gradient-text">₹{currentAmount}</span>
                  </div>
                </div>
              )}

              {/* Donate Button */}
              <Button 
                variant="hero" 
                size="xl" 
                className="w-full"
                onClick={handleDonate}
                disabled={!isValidAmount || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5" />
                    Donate ₹{isValidAmount ? currentAmount : "0"}
                  </>
                )}
              </Button>

              {/* Info */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                Donations are processed securely via Cashfree. Non-refundable.
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-6 text-center">
                <Check className="h-6 w-6 text-success mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Keep It Free</h3>
                <p className="text-sm text-muted-foreground">Help maintain free subdomains for all</p>
              </div>
              <div className="glass-card p-6 text-center">
                <Globe className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Infrastructure</h3>
                <p className="text-sm text-muted-foreground">Fund servers and DNS services</p>
              </div>
              <div className="glass-card p-6 text-center">
                <Heart className="h-6 w-6 text-destructive mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Community Love</h3>
                <p className="text-sm text-muted-foreground">Support the developer community</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Donate;
