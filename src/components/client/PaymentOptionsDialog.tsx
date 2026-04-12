import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Copy, Check, Smartphone, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  price: number;
  onRazorpayClick: () => void;
  isProcessing: boolean;
  upiId?: string;
  qrCodeImage?: string;
  userId?: string;
  projectId?: string;
  userName?: string;
  userEmail?: string;
}

export default function PaymentOptionsDialog({
  open,
  onOpenChange,
  projectTitle,
  price,
  onRazorpayClick,
  isProcessing,
  upiId = "nandishgs1@ibl",
  qrCodeImage,
  userId,
  projectId,
  userName,
  userEmail,
}: PaymentOptionsDialogProps) {
  // Payment method states
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [upiPaymentInitiated, setUpiPaymentInitiated] = useState(false);
  const [dynamicUpiId, setDynamicUpiId] = useState(upiId);
  const [dynamicQrCode, setDynamicQrCode] = useState(qrCodeImage);
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"upi" | "razorpay">("upi");

  // Client information states
  const [step, setStep] = useState<"info" | "payment">("info"); // Track which step we're on
  const [clientName, setClientName] = useState(userName || "");
  const [clientEmail, setClientEmail] = useState(userEmail || "");
  const [clientMobile, setClientMobile] = useState("");
  const [isValidatingInfo, setIsValidatingInfo] = useState(false);

  // Fetch payment settings from database (admin can update via settings panel)
  useEffect(() => {
    if (open) {
      const loadSettings = async () => {
        try {
          // Load from database
          const { data, error } = await (supabase as any)
            .from("payment_settings")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (error && error.code !== "PGRST116") {
            console.error("🔴 Error loading from database:", error);
            console.warn("⚠️ Falling back to localStorage");
            // Fall back to localStorage
            loadFromLocalStorage();
            return;
          }

          if (data) {
            console.log("✅ PaymentOptionsDialog - Loaded from database:", {
              upi_enabled: data.upi_enabled,
              razorpay_enabled: data.razorpay_enabled,
            });

            setDynamicUpiId(data.upi_id);
            setUpiEnabled(data.upi_enabled);
            setRazorpayEnabled(data.razorpay_enabled);

            if (data.qr_code_image_url) {
              setDynamicQrCode(data.qr_code_image_url);
            }

            // Set active tab to first available method
            if (data.upi_enabled) {
              setActiveTab("upi");
            } else if (data.razorpay_enabled) {
              setActiveTab("razorpay");
            }
          } else {
            // No database record, try localStorage
            console.log("📱 No database record found, trying localStorage");
            loadFromLocalStorage();
          }
        } catch (error) {
          console.error("❌ Error in loadSettings:", error);
          loadFromLocalStorage();
        }
      };

      const loadFromLocalStorage = () => {
        const savedUpiId = localStorage.getItem("payment_upi_id");
        const savedQrCode = localStorage.getItem("payment_qr_code");
        const savedUpiEnabledStr = localStorage.getItem("payment_upi_enabled");
        const savedRazorpayEnabledStr = localStorage.getItem("payment_razorpay_enabled");

        console.log("📱 Loading from localStorage:", {
          savedUpiEnabledStr,
          savedRazorpayEnabledStr,
        });

        if (savedUpiId) {
          setDynamicUpiId(savedUpiId);
        }

        if (savedQrCode) {
          setDynamicQrCode(savedQrCode);
        }

        const upiEnabledState = savedUpiEnabledStr === "true";
        const razorpayEnabledState = savedRazorpayEnabledStr === "true";

        setUpiEnabled(upiEnabledState);
        setRazorpayEnabled(razorpayEnabledState);

        // Set active tab
        if (upiEnabledState) {
          setActiveTab("upi");
        } else if (razorpayEnabledState) {
          setActiveTab("razorpay");
        }
      };

      loadSettings();
    }
  }, [open]);

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(dynamicUpiId);
      setCopiedUPI(true);
      toast.success("UPI ID copied to clipboard!");
      setTimeout(() => setCopiedUPI(false), 2000);
    } catch (error) {
      toast.error("Failed to copy UPI ID");
    }
  };

  // Validate client information and proceed to payment
  const handleProceedToPayment = async () => {
    // Validation
    if (!clientName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!clientEmail.trim() || !clientEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!clientMobile.trim() || clientMobile.length < 10) {
      toast.error("Please enter a valid mobile number (10+ digits)");
      return;
    }

    // All validations passed, move to payment step
    setStep("payment");
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setStep("info");
      setClientName(userName || "");
      setClientEmail(userEmail || "");
      setClientMobile("");
    }
  }, [open, userName, userEmail]);

  const recordUPIPayment = async () => {
    if (!userId || !projectId) {
      toast.error("Missing user or project information");
      return;
    }

    if (!clientName.trim() || !clientEmail.trim() || !clientMobile.trim()) {
      toast.error("Please fill in all required information");
      return;
    }

    try {
      // Fetch the project pricing to see what access types are available
      const { data: projectPricing } = await (supabase as any)
        .from("projects_pricing")
        .select("code_access, live_access")
        .eq("project_id", projectId)
        .single();

      // Default: if pricing not found, grant code access only
      const codeAccess = projectPricing?.code_access || true;
      const liveAccess = projectPricing?.live_access || false;

      // Create or update purchase record for UPI payment
      const { data: existingPurchase } = await supabase
        .from("project_purchases")
        .select("*")
        .eq("user_id", userId)
        .eq("project_id", projectId)
        .single();

      if (!existingPurchase) {
        await supabase.from("project_purchases").insert({
          user_id: userId,
          project_id: projectId,
          price,
          currency: "INR",
          payment_status: "completed",
          payment_id: "upi_" + Date.now(),
          payment_method: "upi",
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientMobile,
          project_title: projectTitle,
          code_access: codeAccess,
          live_access: liveAccess,
        });
      } else {
        await supabase
          .from("project_purchases")
          .update({
            payment_status: "completed",
            payment_id: "upi_" + Date.now(),
            payment_method: "upi",
            client_name: clientName,
            client_email: clientEmail,
            client_phone: clientMobile,
            code_access: codeAccess,
            live_access: liveAccess,
          })
          .eq("id", existingPurchase.id);
      }

      toast.success("Payment recorded! Awaiting admin verification.");
      onOpenChange(false);
    } catch (error) {
      console.error("Error recording UPI payment:", error);
      toast.error("Failed to record payment. Please contact support.");
    }
  };

  const handleUPIPayment = () => {
    const encodedTitle = encodeURIComponent(`Project Purchase - ${projectTitle}`);
    const upiUrl = `upi://pay?pa=${dynamicUpiId}&pn=Nandish%20Tech&am=${price}&tn=${encodedTitle}`;
    
    setUpiPaymentInitiated(true);
    window.location.href = upiUrl;
    
    // Show success message after UPI app opens
    toast.info("Opening your UPI app. After payment, your access will be pending admin verification.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Unlock Project</DialogTitle>
          <DialogDescription>
            <div className="space-y-1 mt-2">
              <p className="font-semibold text-foreground">{projectTitle}</p>
              <p className="text-lg font-bold text-primary">₹{price}</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: CLIENT INFORMATION FORM */}
        {step === "info" && (
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground mb-4">
              <p className="font-semibold text-foreground mb-2">Step 1: Your Information</p>
              <p>Please provide your details before proceeding to payment</p>
            </div>

            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Mobile Number Field */}
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-sm font-medium">
                Mobile Number
              </Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="10-digit mobile number"
                value={clientMobile}
                onChange={(e) => setClientMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {clientMobile.length}/10 digits
              </p>
            </div>

            {/* Proceed Button */}
            <Button
              onClick={handleProceedToPayment}
              disabled={isValidatingInfo}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6 flex items-center gap-2"
            >
              {isValidatingInfo ? (
                <span>Validating...</span>
              ) : (
                <>
                  Proceed to Payment
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* STEP 2: PAYMENT OPTIONS */}
        {step === "payment" && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              <p className="font-semibold text-foreground text-sm">Step 2: Select Payment Method</p>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upi" | "razorpay")} className="w-full">
              <TabsList className={`w-full grid-cols-${upiEnabled && razorpayEnabled ? 2 : 1}`}>
                {upiEnabled && (
                  <TabsTrigger value="upi" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span className="hidden sm:inline">UPI Payment</span>
                    <span className="sm:hidden">UPI</span>
                  </TabsTrigger>
                )}
                {razorpayEnabled && (
                  <TabsTrigger value="razorpay" className="flex items-center gap-2">
                    <span className="text-sm">Razorpay</span>
                  </TabsTrigger>
                )}
              </TabsList>

          {/* UPI Payment Tab */}
          {upiEnabled && (
            <TabsContent value="upi" className="space-y-4 mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Choose your payment method:</p>

              {/* QR Code Option */}
              {dynamicQrCode && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      QR Code
                    </p>
                    <Badge variant="outline" className="text-xs">Quick</Badge>
                  </div>
                  <div className="flex justify-center p-3 bg-white rounded-lg border">
                    <img
                      src={dynamicQrCode}
                      alt="UPI QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Scan this QR code with any UPI app to pay
                  </p>
                </div>
              )}

              {/* UPI ID Option */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  UPI ID
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-white dark:bg-slate-900 rounded-lg border font-mono text-sm break-all">
                    {dynamicUpiId}
                  </div>
                  <Button
                    onClick={handleCopyUPI}
                    size="sm"
                    variant="outline"
                    className="px-3"
                  >
                    {copiedUPI ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy and paste this UPI ID in your UPI app
                </p>

                {/* Open UPI App Button */}
                <Button
                  onClick={() => {
                    handleUPIPayment();
                    recordUPIPayment();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
                  disabled={upiPaymentInitiated}
                >
                  {upiPaymentInitiated ? "Payment Processing..." : "Open UPI App"}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
            </div>
            </TabsContent>
          )}

          {/* Razorpay Tab */}
          {razorpayEnabled && (
            <TabsContent value="razorpay" className="space-y-4 mt-4">
            <div className="space-y-3 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
              <p className="text-sm text-muted-foreground">
                Pay securely using Razorpay. This will open a secure payment gateway.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ Multiple payment methods supported</p>
                <p>✓ Secure and encrypted transactions</p>
                <p>✓ Instant payment confirmation</p>
              </div>
            </div>
            </TabsContent>
          )}
        </Tabs>

            {/* Show appropriate button based on enabled methods */}
            {razorpayEnabled && (
              <Button
                onClick={() => {
                  // Store client info in window object so Razorpay can access it
                  (window as any).clientPaymentInfo = {
                    name: clientName,
                    email: clientEmail,
                    phone: clientMobile,
                  };
                  onRazorpayClick();
                }}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5"
              >
                {isProcessing ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⌛</span>
                    Processing...
                  </>
                ) : (
                  "Pay with Razorpay"
                )}
              </Button>
            )}

            {!upiEnabled && !razorpayEnabled && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                No payment methods are currently available. Please contact support.
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground mt-2">
              Your payment information is secure and encrypted
            </p>
          </div>
        )}

        {/* Back to Info Button (shown in payment step) */}
        {step === "payment" && (
          <Button
            onClick={() => setStep("info")}
            variant="outline"
            className="w-full mt-2"
          >
            Back to Information
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
