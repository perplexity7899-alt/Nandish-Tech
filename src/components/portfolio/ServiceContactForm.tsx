import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { submitServiceInquiryResponse, submitServiceAcknowledgmentToClient } from "@/utils/formspreeSubmit";

interface ServiceData {
  id: string;
  title: string;
  price: string;
  price_unit: string;
}

interface ServiceContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: ServiceData | null;
}

export default function ServiceContactForm({
  isOpen,
  onClose,
  selectedService = null,
}: ServiceContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    serviceTitle: selectedService?.title || "",
    servicePrice: selectedService?.price || "",
    servicePriceUnit: selectedService?.price_unit || "onwards",
    message: "",
    mobileNumber: "",
    deliveryTimeline: "1-week",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const navigate = useNavigate();

  // Fetch services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("servicesoffer")
          .select("id, title, price, price_unit")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // Update form when selectedService changes
  useEffect(() => {
    if (selectedService) {
      setFormData((prev) => ({
        ...prev,
        serviceTitle: selectedService.title || "",
        servicePrice: selectedService.price || "",
        servicePriceUnit: selectedService.price_unit || "onwards",
      }));
    }
  }, [selectedService, isOpen]);

  const deliveryOptions = [
    { value: "1-week", label: "1 Week" },
    { value: "2-weeks", label: "2 Weeks" },
    { value: "15-days", label: "15 Days" },
    { value: "1-month", label: "1 Month" },
    { value: "custom", label: "Custom Timeline" },
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
          service_price: formData.servicePrice,
          service_price_unit: formData.servicePriceUnit,
          delivery_timeline: formData.deliveryTimeline,
          project_details: formData.message,
          inquiry_type: "service-inquiry",
          
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      // Try to send email notification via Formspree (optional - won't fail form if email fails)
      try {
        // Send service inquiry email to admin
        await submitServiceInquiryResponse({
          adminName: "Nandish-Tech Team",
          serviceType: formData.serviceTitle,
          responseSubject: `New Service Inquiry - ${formData.serviceTitle}`,
          responseMessage: `
New Service Inquiry Submission:

Client Name: ${formData.name}
Client Email: ${formData.email}
Client Phone: ${formData.mobileNumber}

Service: ${formData.serviceTitle}
Delivery Timeline: ${formData.deliveryTimeline}

Project Details:
${formData.message || "No additional details provided"}

---
Please reply to: ${formData.email}
          `,
          clientEmail: formData.email,
          timeline: formData.deliveryTimeline,
          priority: "normal",
        }).catch(() => {
          // Email sending failed but that's okay
          console.log("Email notification skipped");
        });
      } catch (emailError) {
        console.log("Email notification error (non-critical):", emailError);
        // Don't fail the form submission if email fails
      }

      // Send acknowledgment email to client
      try {
        await submitServiceAcknowledgmentToClient({
          clientEmail: formData.email,
          clientName: formData.name,
          serviceTitle: formData.serviceTitle,
        }).catch(() => {
          console.log("Client acknowledgment email skipped");
        });
      } catch (clientEmailError) {
        console.log("Client email notification error (non-critical):", clientEmailError);
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
        serviceTitle: selectedService?.title || "",
        servicePrice: selectedService?.price || "",
        servicePriceUnit: selectedService?.price_unit || "onwards",
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
              <p className="text-muted-foreground whitespace-pre-line">
                Hi! Thanks for reaching out 😊
                <br/>
                Please share your requirements, timeline, and budget.
                <br/>
                I'll review and get back with the best solution.
                <br/>
                Looking forward to working with you!
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-background rounded-t-lg sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-none flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5 sticky top-0 z-10">
          <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground">
            Get a Custom Quote
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Service Display Card */}
          {formData.serviceTitle && (
            <div className="bg-gradient-to-br from-primary/15 to-accent/10 border-2 border-primary/30 rounded-xl p-4 sm:p-5 -mx-4 sm:mx-0 sm:rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Selected Service</p>
                  <p className="font-bold text-foreground text-lg sm:text-xl">{formData.serviceTitle}</p>
                </div>
                {formData.servicePrice && (
                  <div className="bg-white dark:bg-foreground/5 rounded-lg p-3 sm:p-4 border border-primary/20 sm:text-right">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Starting Price</p>
                    <div className="flex items-baseline gap-1 sm:flex-col">
                      <p className="font-bold text-primary text-2xl sm:text-3xl">₹{formData.servicePrice}</p>
                      <p className="text-xs text-muted-foreground ml-auto sm:ml-0 sm:mt-1">{formData.servicePriceUnit}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2.5">
              Your Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 sm:py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-base sm:text-sm"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2.5">
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 sm:py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-base sm:text-sm"
            />
          </div>

          {/* Mobile Number Field */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2.5">
              Mobile Number <span className="text-destructive">*</span>
            </label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className="w-full px-4 py-3 sm:py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-base sm:text-sm"
            />
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2.5">
              Service <span className="text-destructive">*</span>
            </label>
            <select
              name="serviceTitle"
              value={formData.serviceTitle}
              onChange={(e) => {
                const selectedTitle = e.target.value;
                const selectedService = services.find(s => s.title === selectedTitle);
                setFormData({
                  ...formData,
                  serviceTitle: selectedTitle,
                  servicePrice: selectedService?.price || "",
                  servicePriceUnit: selectedService?.price_unit || "onwards",
                });
              }}
              className="w-full px-4 py-3 sm:py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-base sm:text-sm"
            >
              <option value="">Select a service</option>
              {loadingServices ? (
                <option disabled>Loading services...</option>
              ) : services.length > 0 ? (
                services.map((service) => (
                  <option key={service.id} value={service.title}>
                    {service.title} - ₹{service.price} {service.price_unit}
                  </option>
                ))
              ) : (
                <option disabled>No services available</option>
              )}
            </select>
          </div>

          {/* Delivery Timeline */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2.5">
              Delivery Timeline
            </label>
            <select
              name="deliveryTimeline"
              value={formData.deliveryTimeline}
              onChange={handleChange}
              className="w-full px-4 py-3 sm:py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-base sm:text-sm"
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
            <label className="block text-sm font-semibold text-foreground mb-2.5">
              Project Details
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us more about your project requirements, design preferences, or any specific features you need..."
              rows={4}
              className="w-full px-4 py-3 sm:py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none text-base sm:text-sm"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-3 pt-4 sm:pt-2 pb-4 sm:pb-0">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 sm:py-2 text-base sm:text-sm rounded-lg transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Get Started"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full py-3 sm:py-2 text-base sm:text-sm rounded-lg"
            >
              Cancel
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
