import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, Toggle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

interface PaymentSettings {
  id?: string;
  upi_id: string;
  qr_code_image?: string;
  upi_enabled: boolean;
  razorpay_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function PaymentSettingsManager() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load from database (payment_settings table)
      const { data, error } = await (supabase as any)
        .from("payment_settings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading payment settings:", error);
        toast.error("Failed to load payment settings");
        setIsLoading(false);
        return;
      }

      if (data) {
        // Settings exist in database
        console.log("📊 Loaded payment settings from database:", data);
        
        setSettings(data);
        setUpiId(data.upi_id);
        setUpiEnabled(data.upi_enabled);
        setRazorpayEnabled(data.razorpay_enabled);
        if (data.qr_code_image_url) {
          setQrCodeImage(data.qr_code_image_url);
          setPreviewUrl(data.qr_code_image_url);
        }
      } else {
        // No settings yet - initialize with defaults
        console.log("📊 No payment settings found - using defaults");
        
        const defaultSettings = {
          upi_id: "nandishgs1@ibl",
          upi_enabled: true,
          razorpay_enabled: true,
          payment_name: "Nandish-Tech",
        };
        
        setUpiId(defaultSettings.upi_id);
        setUpiEnabled(defaultSettings.upi_enabled);
        setRazorpayEnabled(defaultSettings.razorpay_enabled);
      }
    } catch (error) {
      console.error("Error loading payment settings:", error);
      toast.error("Failed to load payment settings");
      // Set defaults on error
      setUpiEnabled(true);
      setRazorpayEnabled(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file is an image
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewUrl(result);
        setQrCodeImage(result);
        setUploadedFileName(file.name);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling image:", error);
      toast.error("Failed to process image");
    }
  };

  const handleSave = async () => {
    if (!upiId.trim() && upiEnabled) {
      toast.error("Please enter a UPI ID if UPI is enabled");
      return;
    }

    if (!upiEnabled && !razorpayEnabled) {
      toast.error("Please enable at least one payment method");
      return;
    }

    try {
      setIsSaving(true);

      if (settings?.id) {
        // Update existing record
        const { error } = await (supabase as any)
          .from("payment_settings")
          .update({
            upi_id: upiId.trim(),
            upi_enabled: upiEnabled,
            razorpay_enabled: razorpayEnabled,
            qr_code_image_url: qrCodeImage || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", settings.id);

        if (error) {
          console.error("🔴 Error updating payment settings:", error);
          console.error("Error code:", error?.code);
          console.error("Error message:", error?.message);
          
          // Fallback: Save to localStorage if database update fails
          console.warn("⚠️ Database update failed, falling back to localStorage");
          localStorage.setItem("payment_upi_id", upiId.trim());
          localStorage.setItem("payment_upi_enabled", String(upiEnabled));
          localStorage.setItem("payment_razorpay_enabled", String(razorpayEnabled));
          if (qrCodeImage) {
            localStorage.setItem("payment_qr_code", qrCodeImage);
          }
          
          toast.warning("Settings saved to local storage (database update failed)");
          return;
        }
        
        // Save to localStorage as backup
        localStorage.setItem("payment_upi_id", upiId.trim());
        localStorage.setItem("payment_upi_enabled", String(upiEnabled));
        localStorage.setItem("payment_razorpay_enabled", String(razorpayEnabled));
      } else {
        // Create new record (first time)
        console.log("📝 Attempting to create new payment settings record...");
        const { data: insertData, error } = await (supabase as any)
          .from("payment_settings")
          .insert({
            upi_id: upiId.trim(),
            upi_enabled: upiEnabled,
            razorpay_enabled: razorpayEnabled,
            qr_code_image_url: qrCodeImage || null,
            payment_name: "Nandish-Tech",
          })
          .select();

        if (error) {
          console.error("🔴 Error creating payment settings:", error);
          console.error("Error code:", error?.code);
          console.error("Error message:", error?.message);
          console.error("Full error object:", JSON.stringify(error, null, 2));
          
          // Fallback: Save to localStorage if database insert fails
          console.warn("⚠️ Database insert failed, falling back to localStorage");
          localStorage.setItem("payment_upi_id", upiId.trim());
          localStorage.setItem("payment_upi_enabled", String(upiEnabled));
          localStorage.setItem("payment_razorpay_enabled", String(razorpayEnabled));
          if (qrCodeImage) {
            localStorage.setItem("payment_qr_code", qrCodeImage);
          }
          
          toast.warning("Settings saved to local storage (database insert failed)");
          return;
        }

        console.log("✅ Payment settings record created:", insertData);
        
        // Save to localStorage as backup
        localStorage.setItem("payment_upi_id", upiId.trim());
        localStorage.setItem("payment_upi_enabled", String(upiEnabled));
        localStorage.setItem("payment_razorpay_enabled", String(razorpayEnabled));
      }

      console.log("💾 Payment settings saved to database:", {
        upi_id: upiId.trim(),
        upi_enabled: upiEnabled,
        razorpay_enabled: razorpayEnabled,
      });

      toast.success("Payment settings saved successfully!");
      
      // Reload settings to update the page
      await new Promise(resolve => setTimeout(resolve, 500));
      loadPaymentSettings();
    } catch (error) {
      console.error("Error saving payment settings:", error);
      toast.error("Failed to save payment settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure payment methods available to clients
        </p>
      </div>

      {/* Payment Method Selection */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle>Available Payment Methods</CardTitle>
          <CardDescription>
            Choose which payment methods clients can use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* UPI Payment Method Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
            <div className="space-y-1">
              <Label className="text-base font-semibold">UPI Payment</Label>
              <p className="text-sm text-muted-foreground">Enable UPI (QR Code + UPI ID)</p>
            </div>
            <Switch
              checked={upiEnabled}
              onCheckedChange={setUpiEnabled}
            />
          </div>

          {/* Razorpay Payment Method Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Razorpay</Label>
              <p className="text-sm text-muted-foreground">Enable Razorpay payment gateway</p>
            </div>
            <Switch
              checked={razorpayEnabled}
              onCheckedChange={setRazorpayEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UPI ID Section - Only show if UPI is enabled */}
        {upiEnabled && (
          <Card>
            <CardHeader>
              <CardTitle>UPI Configuration</CardTitle>
              <CardDescription>
                Update the UPI ID that clients will use for payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upi-id">UPI ID</Label>
                <Input
                  id="upi-id"
                  placeholder="e.g., nandishgs1@ibl"
                  value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Format: username@bankname (e.g., name@ybl, name@okhdfcbank, name@axl)
              </p>
            </div>

            {settings && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="text-muted-foreground">Last updated:</p>
                <p className="font-semibold">
                  {new Date(settings.updated_at || settings.created_at).toLocaleString()}
                </p>
              </div>
            )}
            </CardContent>
          </Card>
        )}

        {/* QR Code Section - Only show if UPI is enabled */}
        {upiEnabled && (
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>
                Upload a QR code image for quick UPI payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-upload">Upload QR Code Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="qr-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                </div>
                {uploadedFileName && (
                  <p className="text-sm text-green-600">Selected: {uploadedFileName}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image (PNG or JPG)
                </p>
              </div>

              {/* QR Code Preview */}
              {previewUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 flex items-center justify-center bg-muted/30">
                  <img
                    src={previewUrl}
                    alt="QR Code Preview"
                    className="max-w-40 max-h-40 object-contain"
                  />
                </div>
              </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save Button */}
      <div className="flex gap-2 justify-end">
        <Button
          onClick={loadPaymentSettings}
          disabled={isSaving}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>

      {/* Current Settings Display */}
      {settings && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-green-900">Active Payment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current UPI ID</p>
              <p className="font-mono font-semibold text-lg">{settings.upi_id}</p>
            </div>
            {settings.qr_code_image && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">QR Code</p>
                <div className="border rounded-lg p-3 inline-block bg-white">
                  <img
                    src={settings.qr_code_image}
                    alt="Current QR Code"
                    className="w-32 h-32 object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
