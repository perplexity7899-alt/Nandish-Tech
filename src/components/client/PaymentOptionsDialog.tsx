import { useState } from "react";
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
import { QrCode, Copy, Check, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface PaymentOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  price: number;
  onRazorpayClick: () => void;
  isProcessing: boolean;
  upiId?: string;
  qrCodeImage?: string;
}

export default function PaymentOptionsDialog({
  open,
  onOpenChange,
  projectTitle,
  price,
  onRazorpayClick,
  isProcessing,
  upiId = "nandishgs1@ybl",
  qrCodeImage,
}: PaymentOptionsDialogProps) {
  const [copiedUPI, setCopiedUPI] = useState(false);

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopiedUPI(true);
      toast.success("UPI ID copied to clipboard!");
      setTimeout(() => setCopiedUPI(false), 2000);
    } catch (error) {
      toast.error("Failed to copy UPI ID");
    }
  };

  const handleUPIPayment = () => {
    const encodedTitle = encodeURIComponent(`Project Purchase - ${projectTitle}`);
    const upiUrl = `upi://pay?pa=${upiId}&pn=Nandish%20Tech&am=${price}&tn=${encodedTitle}`;
    window.location.href = upiUrl;
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

        <Tabs defaultValue="upi" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upi" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">UPI Payment</span>
              <span className="sm:hidden">UPI</span>
            </TabsTrigger>
            <TabsTrigger value="razorpay" className="flex items-center gap-2">
              <span className="text-sm">Razorpay</span>
            </TabsTrigger>
          </TabsList>

          {/* UPI Payment Tab */}
          <TabsContent value="upi" className="space-y-4 mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Choose your payment method:</p>

              {/* QR Code Option */}
              {qrCodeImage && (
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
                      src={qrCodeImage}
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
                    {upiId}
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
                  onClick={handleUPIPayment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
                >
                  Open UPI App
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

          {/* Razorpay Tab */}
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
        </Tabs>

        {/* Razorpay Button */}
        <Button
          onClick={onRazorpayClick}
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

        <p className="text-xs text-center text-muted-foreground mt-2">
          Your payment information is secure and encrypted
        </p>
      </DialogContent>
    </Dialog>
  );
}
