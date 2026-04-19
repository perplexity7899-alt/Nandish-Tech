import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ServiceContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: string;
}

export default function ServiceContactForm({
  isOpen,
  onClose,
  selectedService = "",
}: ServiceContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    serviceTitle: selectedService,
    message: "",
    mobileNumber: "",
    deliveryTimeline: "1-week",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const navigate = useNavigate();

  const deliveryOptions = [
    { value: "1-week", label: "1 Week" },
    { value: "2-weeks", label: "2 Weeks" },
    { value: "15-days", label: "15 Days" },
    { value: "1-month", label: "1 Month" },
    { value: "custom", label: "Custom Timeline" },
  ];

  const services = [
    "Website Development",
    "Landing Pages",
    "AI Chatbot Integration",
    "Full Stack Development",
    "Custom Project",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.mobileNumber.trim() ||
        !formData.serviceTitle
      ) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }

      // Validate phone number
      if (formData.mobileNumber.length < 10) {
        toast.error("Please enter a valid mobile number");
        setIsSubmitting(false);
        return;
      }

      // Save inquiry directly to client_replies table with all details
      const { error: dbError } = await (supabase as any)
        .from("client_replies")
        .insert({
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.mobileNumber,
          service_type: formData.serviceTitle.toLowerCase().replace(/\s+/g, "-"),
          delivery_timeline: formData.deliveryTimeline,
          project_details: formData.message,
          inquiry_type: "service-inquiry",
          
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      // Try to send email notification (optional - won't fail form if email fails)
      try {
        // Email to admin
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: "admin@nandish-tech.com",
            subject: `New Custom Project Inquiry - ${formData.serviceTitle}`,
            name: formData.name,
            email: formData.email,
            phone: formData.mobileNumber,
            service: formData.serviceTitle,
            timeline: formData.deliveryTimeline,
            message: formData.message,
            type: "custom-project-inquiry",
          }),
        }).catch(() => {
          // Email sending failed but that's okay
          console.log("Email notification skipped");
        });

        // Send confirmation email to user
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: formData.email,
            subject: "We Received Your Custom Project Inquiry - Nandish-Tech",
            name: formData.name,
            serviceTitle: formData.serviceTitle,
            type: "inquiry-confirmation",
          }),
        }).catch(() => {
          // Email sending failed but that's okay
          console.log("Confirmation email skipped");
        });
      } catch (emailError) {
        console.log("Email notification error (non-critical):", emailError);
        // Don't fail the form submission if email fails
      }

      // Show success message
      toast.success(
        "Thank you! We'll contact you soon regarding your project."
      );

      // Store email and show success modal
      setSubmittedEmail(formData.email);
      setShowSuccessMessage(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        serviceTitle: selectedService,
        message: "",
        mobileNumber: "",
        deliveryTimeline: "1-week",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });
      toast.error(`Failed to submit form: ${error?.message || "Please try again."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Show success message if form was submitted
  if (showSuccessMessage) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6 sm:p-8 text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Success Title */}
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Request Received! ✓
              </h2>
              <p className="text-muted-foreground">
                Thank you for submitting your project inquiry. Our team has received your request.
              </p>
            </div>

            {/* Registration Prompt */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-lg">📧</span> Next Step: Register & Sign In
              </h3>
              <p className="text-sm text-muted-foreground">
                To receive admin replies and manage your projects, please create an account using this email:
              </p>
              <div className="bg-background rounded p-3 text-center">
                <p className="font-mono text-sm font-medium text-primary break-all">
                  {submittedEmail}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Once you sign up, you'll be able to see all communications from our admin team in your dashboard.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => {
                  setShowSuccessMessage(false);
                  onClose();
                  navigate("/register");
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccessMessage(false);
                  onClose();
                  navigate("/login");
                }}
                className="w-full"
              >
                Already Have an Account? Sign In
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSuccessMessage(false);
                  onClose();
                }}
                className="w-full"
              >
                Close
              </Button>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
              <p>✓ Our team will review your inquiry</p>
              <p>✓ You'll receive contact details to your email</p>
              <p>✓ Sign in to see admin responses in your dashboard</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl my-4 sm:my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Get a Custom Quote
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm sm:text-base"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm sm:text-base"
            />
          </div>

          {/* Mobile Number Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Mobile Number <span className="text-destructive">*</span>
            </label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm sm:text-base"
            />
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Service <span className="text-destructive">*</span>
            </label>
            <select
              name="serviceTitle"
              value={formData.serviceTitle}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm sm:text-base"
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Timeline */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Delivery Timeline
            </label>
            <select
              name="deliveryTimeline"
              value={formData.deliveryTimeline}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm sm:text-base"
            >
              {deliveryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Project Details
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us more about your project requirements, design preferences, or any specific features you need..."
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none text-sm sm:text-base"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1"
            >
              {isSubmitting ? "Submitting..." : "Get Started"}
            </Button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="px-4 sm:px-6 py-4 bg-muted/30 border-t border-border text-xs text-muted-foreground text-center">
          We'll review your requirements and contact you within 24 hours with a
          detailed proposal.
        </div>
      </div>
    </div>
  );
}
