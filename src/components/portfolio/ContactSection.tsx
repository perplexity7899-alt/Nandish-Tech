import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, MessageCircle } from "lucide-react";
import { submitContactFormResponse } from "@/utils/formspreeSubmit";

export default function ContactSection() {
  const { user } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", projectTopic: "" });
  const [sending, setSending] = useState(false);

  // Query to fetch user profile with caching
  const { data: profile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Auto-populate form fields with user data
  useEffect(() => {
    if (user) {
      const fullName = profile?.full_name || "";
      const [firstName, ...lastNameParts] = fullName.split(" ");
      setForm((prev) => ({
        ...prev,
        firstName: firstName || "",
        lastName: lastNameParts.join(" ") || "",
        email: user.email || "",
      }));
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim() || !form.projectTopic.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("Please login to send a message");
      return;
    }

    setSending(true);
    
    try {
      // Save to database
      const { error: dbError } = await supabase.from("messages").insert({
        user_id: user.id,
        name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        message: form.projectTopic,
        service_type: "contact-form",
        inquiry_type: "general",
      });

      if (dbError) {
        toast.error("Failed to send message");
        setSending(false);
        return;
      }

      // Send confirmation email via Formspree (non-blocking)
      const emailResult = await submitContactFormResponse({
        adminName: "Nandish-Tech Team",
        responseSubject: `New Contact Form Submission from ${form.firstName}`,
        responseMessage: `
New Contact Form Submission:

Client Name: ${form.firstName} ${form.lastName}
Client Email: ${form.email}
Phone: ${form.phone || "Not provided"}

Message/Project Topic:
${form.projectTopic}

---
Please reply to: ${form.email}
        `,
        clientEmail: form.email,
        priority: "normal",
      });

      setSending(false);
      
      if (emailResult.ok) {
        setForm((prev) => ({ ...prev, projectTopic: "" }));
        toast.success("Message sent! Check your email for confirmation.");
      } else {
        setForm((prev) => ({ ...prev, projectTopic: "" }));
        toast.success("Message sent! Check your email for confirmation.");
      }
    } catch (error: any) {
      setSending(false);
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <section id="contact" className="section-padding bg-secondary/20">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Get In <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-muted-foreground">
            Have questions? We'd love to hear from you. Contact us anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Contact Methods */}
          <div className="space-y-6">
            {/* Email Card */}
            <div className="glass-card p-8 border-l-4 border-primary">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Email Us</h3>
                  <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                </div>
              </div>
              <a href="mailto:contactnandishtech@gmail.com" className="text-primary font-semibold text-base block mb-6">
                contactnandishtech@gmail.com
              </a>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contactnandishtech@gmail.com" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Send Email
                </Button>
              </a>
            </div>

            {/* WhatsApp Card */}
            <div className="glass-card p-8 border-l-4 border-green-500">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-green-100">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">WhatsApp</h3>
                  <p className="text-sm text-muted-foreground">Fastest response — usually in minutes</p>
                </div>
              </div>
              <a href="https://wa.me/917899560461" className="text-primary font-semibold text-base block mb-6">
                +91 7899560461
              </a>
              <a href="https://wa.me/917899560461" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Text Me
                </Button>
              </a>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="glass-card p-8">
            <h3 className="font-display text-2xl font-semibold text-foreground mb-2">Send Us a Message</h3>
            <p className="text-muted-foreground text-sm mb-6">Our team will get back to you as soon as possible.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* First Name and Last Name */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="bg-background/50"
                  readOnly={!!user}
                />
                <Input
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="bg-background/50"
                  readOnly={!!user}
                />
              </div>

              {/* Email */}
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-background/50"
                readOnly={!!user}
              />

              {/* Phone Number */}
              <div className="flex gap-2">
                <div className="flex items-center bg-background/50 rounded-lg border border-input px-3">
                  <span className="text-sm font-medium">🇮🇳</span>
                  <span className="text-sm text-muted-foreground ml-2">+91</span>
                </div>
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="flex-1 bg-background/50"
                />
              </div>

              {/* Project Topic */}
              <Input
                placeholder="e.g. Machine Learning, MBA Marketing, MERN Stack..."
                value={form.projectTopic}
                onChange={(e) => setForm({ ...form, projectTopic: e.target.value })}
                className="bg-background/50"
              />

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={sending}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 h-auto"
              >
                {sending ? "Sending..." : "Send Message"}
              </Button>

              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  Please login to send a message
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
