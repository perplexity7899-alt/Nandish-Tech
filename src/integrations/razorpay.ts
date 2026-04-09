import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Initialize Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface PaymentOptions {
  projectId: string;
  projectTitle: string;
  price: number;
  userEmail: string;
  userName: string;
  userId: string;
}

export const initiatePayment = async (options: PaymentOptions) => {
  const { projectId, projectTitle, price, userEmail, userName, userId } = options;

  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error("Failed to load payment gateway. Please try again.");
      return;
    }

    // Check if purchase already exists
    const { data: existingPurchase, error: checkError } = await (supabase as any)
      .from("project_purchases")
      .select("*")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .single();

    if (existingPurchase) {
      if (existingPurchase.payment_status === "completed") {
        toast.info("You already have access to this project!");
        return;
      }
      if (existingPurchase.payment_status === "pending") {
        console.log("Retrying payment for pending purchase:", existingPurchase.id);
      }
    }

    // Create or get purchase record
    let purchase = existingPurchase;
    
    if (!purchase) {
      const { data: newPurchase, error: purchaseError } = await (supabase as any)
        .from("project_purchases")
        .insert({
          user_id: userId,
          project_id: projectId,
          price,
          currency: "INR",
          payment_status: "pending",
          payment_id: "temp_" + Date.now(),
        })
        .select()
        .single();

      if (purchaseError) {
        console.error("❌ Purchase creation error:", {
          code: purchaseError.code,
          message: purchaseError.message,
          details: purchaseError.details,
          hint: purchaseError.hint,
        });
        toast.error(`Failed to create purchase: ${purchaseError.message}`);
        return;
      }
      purchase = newPurchase;
    }

    console.log("🛒 Purchase record ready:", purchase);
    console.log("💳 Razorpay Key:", import.meta.env.VITE_RAZORPAY_KEY_ID);

    // Razorpay payment options
    const razorpayOptions: any = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY",
      amount: Math.round(price * 100), // Amount in paise (ensure it's an integer)
      currency: "INR",
      name: "Nandish-Tech",
      description: `Purchase: ${projectTitle}`,
      prefill: {
        name: userName,
        email: userEmail,
      },
      handler: async (response: any) => {
        const { razorpay_payment_id } = response;
        console.log("✅ Payment successful:", razorpay_payment_id);

        const { error: updateError } = await (supabase as any)
          .from("project_purchases")
          .update({
            payment_id: razorpay_payment_id,
            payment_status: "completed",
            code_access: true,
            live_access: true,
          })
          .eq("id", purchase.id);

        if (updateError) {
          console.error("Update error:", updateError);
          toast.error("Failed to update payment status");
          return;
        }

        toast.success("Payment successful! You now have access to the project.");
      },
      modal: {
        ondismiss: () => {
          console.log("Payment cancelled by user");
          (supabase as any)
            .from("project_purchases")
            .update({ payment_status: "failed" })
            .eq("id", purchase.id)
            .then(() => {})
            .catch(() => {});

          toast.info("Payment cancelled");
        },
      },
      theme: {
        color: "#10b981",
      },
    };

    console.log("🎟️ Razorpay options:", razorpayOptions);

    // Check if Razorpay is loaded on window
    if (!(window as any).Razorpay) {
      toast.error("Razorpay not loaded. Please refresh and try again.");
      return;
    }

    const razorpay = new (window as any).Razorpay(razorpayOptions);
    razorpay.open();
  } catch (error: any) {
    console.error("Payment error:", error);
    toast.error(`Payment error: ${error.message}`);
  }
};

// Check if user has purchased a project
export const checkProjectAccess = async (
  userId: string,
  projectId: string
): Promise<{ hasAccess: boolean; codeAccess: boolean; liveAccess: boolean }> => {
  const { data, error } = await (supabase as any)
    .from("project_purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .eq("payment_status", "completed")
    .single();

  if (error || !data) {
    return { hasAccess: false, codeAccess: false, liveAccess: false };
  }

  return {
    hasAccess: true,
    codeAccess: data.code_access || false,
    liveAccess: data.live_access || false,
  };
};
