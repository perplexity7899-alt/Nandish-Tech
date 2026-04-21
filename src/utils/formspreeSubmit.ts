/**
 * Form Submission Utility
 * Handles form submissions via Vercel API endpoint with SendGrid
 */

import { FORMSPREE_ENDPOINTS, ADMIN_EMAIL } from "@/config/formspreeConfig";

export interface FormspreeResponse {
  ok: boolean;
  status: number;
  message?: string;
}

/**
 * Submit a response form to Formspree
 * @param formType - Type of form: 'contact-form' | 'service-inquiry' | 'mail-to-client' | 'service-inquiry-acknowledgment'
 * @param data - Form data to submit
 * @returns Promise with success status
 */
export async function submitFormspreeResponse(
  formType: "contact-form" | "service-inquiry" | "mail-to-client" | "service-inquiry-acknowledgment",
  data: Record<string, string | number | boolean>
): Promise<FormspreeResponse> {
  try {
    // Get the appropriate endpoint
    let endpoint = "";

    if (formType === "contact-form") {
      endpoint = FORMSPREE_ENDPOINTS.contactFormResponse;
    } else if (formType === "service-inquiry") {
      endpoint = FORMSPREE_ENDPOINTS.serviceInquiryResponse;
    } else if (formType === "mail-to-client") {
      endpoint = FORMSPREE_ENDPOINTS.mailToClientsResponse;
    } else if (formType === "service-inquiry-acknowledgment") {
      endpoint = FORMSPREE_ENDPOINTS.serviceInquiryResponse;
    }

    if (!endpoint) {
      return {
        ok: false,
        status: 400,
        message: "Invalid form type",
      };
    }

    // Submit the form to Formspree
    console.log("Submitting to Formspree:", { endpoint, data });
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Formspree response status:", response.status);

    // Handle response
    if (response.ok || response.status === 200 || response.status === 201) {
      try {
        const result = await response.json();
        console.log("Formspree response:", result);
      } catch (e) {
        console.log("Response body is not JSON");
      }
      return {
        ok: true,
        status: response.status,
        message: "Form submitted successfully",
      };
    } else {
      try {
        const error = await response.json();
        console.error("Formspree error:", error);
        return {
          ok: false,
          status: response.status,
          message: error.message || `Failed to submit form (${response.status})`,
        };
      } catch (e) {
        console.error("Error parsing Formspree response:", e);
        return {
          ok: false,
          status: response.status,
          message: `Failed to submit form (${response.status})`,
        };
      }
    }
  } catch (error: any) {
    console.error("Formspree submission error:", error);
    return {
      ok: false,
      status: 500,
      message: error?.message || "An error occurred while submitting the form",
    };
  }
}

/**
 * Submit contact form response
 * Used when admin responds to a general contact inquiry
 * Sends notification to admin email with client details
 * Now sends FROM client email TO admin email
 */
export async function submitContactFormResponse(data: {
  adminName: string;
  responseSubject: string;
  responseMessage: string;
  clientEmail: string;
  priority?: "urgent" | "normal" | "low";
}) {
  return submitFormspreeResponse("contact-form", {
    // Send to admin email (Formspree requires 'email' field)
    email: ADMIN_EMAIL,
    _subject: `${data.responseSubject}`,
    client_email: data.clientEmail,
    admin_name: data.adminName,
    message: data.responseMessage,
    priority: data.priority || "normal",
    form_type: "contact-form",
    form_submission: "true",
  });
}

/**
 * Submit service inquiry response
 * Used when admin responds to a service-specific inquiry
 * Sends notification to admin email with inquiry details
 * Now sends FROM client email TO admin email
 */
export async function submitServiceInquiryResponse(data: {
  adminName: string;
  serviceType: string;
  responseSubject: string;
  responseMessage: string;
  clientEmail: string;
  timeline?: string;
  priority?: "urgent" | "normal" | "low";
}) {
  return submitFormspreeResponse("service-inquiry", {
    // Send to admin email (Formspree requires 'email' field)
    email: ADMIN_EMAIL,
    _subject: `[Service Inquiry] ${data.responseSubject}`,
    client_email: data.clientEmail,
    admin_name: data.adminName,
    service_type: data.serviceType,
    message: data.responseMessage,
    timeline: data.timeline || "N/A",
    priority: data.priority || "normal",
    form_type: "service-inquiry",
  });
}

/**
 * Submit mail to client response
 * Used when admin sends direct message to a client
 * Sends notification to admin email with client email in CC
 */
export async function submitMailToClientResponse(data: {
  adminName: string;
  subject: string;
  messageBody: string;
  recipientEmail: string;
  priority?: "urgent" | "normal" | "low";
}) {
  return submitFormspreeResponse("mail-to-client", {
    email: ADMIN_EMAIL,
    _subject: `[Mail to Client] ${data.subject}`,
    _cc: data.recipientEmail,
    admin_name: data.adminName,
    message: data.messageBody,
    recipient_email: data.recipientEmail,
    priority: data.priority || "normal",
    form_type: "mail-to-client",
  });
}

/**
 * Send service inquiry acknowledgment to client
 * Sends the custom acknowledgment message with all form data to the client
 */
export async function submitServiceAcknowledgmentToClient(data: {
  clientEmail: string;
  clientName: string;
  serviceTitle: string;
  servicePrice?: string;
  servicePriceUnit?: string;
  message?: string;
  mobileNumber?: string;
  deliveryTimeline?: string;
}) {
  const acknowledgmentMessage = `Hi ${data.clientName}! 👋

Thanks for reaching out 😊

Your inquiry for **${data.serviceTitle}** has been received successfully.

📋 **Your Inquiry Details:**
- **Service:** ${data.serviceTitle}
- **Price:** ${data.servicePrice} ${data.servicePriceUnit || "onwards"}
- **Preferred Timeline:** ${data.deliveryTimeline || "Not specified"}
- **Mobile Number:** ${data.mobileNumber || "Not provided"}
- **Message:** ${data.message || "No additional message"}

I'll review all your details and get back with the best solution.
Looking forward to working with you!

---
Best regards,
Nandish-Tech Team
contactnandishtech@gmail.com`;

  return submitFormspreeResponse("service-inquiry-acknowledgment", {
    email: data.clientEmail,
    _subject: `We Received Your Inquiry - ${data.serviceTitle}`,
    client_name: data.clientName,
    service_title: data.serviceTitle,
    service_price: data.servicePrice || "Not specified",
    service_price_unit: data.servicePriceUnit || "onwards",
    delivery_timeline: data.deliveryTimeline || "Not specified",
    mobile_number: data.mobileNumber || "Not provided",
    inquiry_message: data.message || "No message",
    acknowledgment_message: acknowledgmentMessage,
    form_type: "service-inquiry-acknowledgment",
  });
}
