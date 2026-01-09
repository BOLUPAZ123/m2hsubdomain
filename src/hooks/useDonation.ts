import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useDonation() {
  const { session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const createDonation = useCallback(async (
    amount: number,
    currency: string = "INR",
    customerEmail?: string,
    customerName?: string,
    customerPhone?: string,
    returnUrl?: string
  ) => {
    setIsProcessing(true);

    try {
      const response = await supabase.functions.invoke("cashfree-payment", {
        body: {
          action: "create-order",
          amount,
          currency,
          customerEmail,
          customerName,
          customerPhone,
          returnUrl,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to create payment");
      }

      return {
        success: true,
        orderId: response.data.orderId,
        paymentSessionId: response.data.paymentSessionId,
        checkoutUrl: response.data.checkoutUrl,
        amount: response.data.orderAmount,
        currency: response.data.orderCurrency,
        isProduction: response.data.isProduction,
      };
    } catch (err: any) {
      toast.error(err.message || "Failed to process donation");
      return { success: false, error: err.message };
    } finally {
      setIsProcessing(false);
    }
  }, [session]);

  const verifyPayment = useCallback(async (orderId: string) => {
    try {
      const response = await supabase.functions.invoke("cashfree-payment", {
        body: {
          action: "verify-payment",
          orderId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return {
        success: true,
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    createDonation,
    verifyPayment,
    isProcessing,
  };
}
