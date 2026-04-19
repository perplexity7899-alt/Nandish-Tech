/**
 * Formspree Configuration
 * Contains all Formspree form endpoints for email responses
 */

// Admin email where all form responses will be sent
export const ADMIN_EMAIL = "contactnandishtech@gmail.com";

export const FORMSPREE_ENDPOINTS = {
  // Contact form responses - for general contact inquiries
  contactFormResponse: "https://formspree.io/f/xpqkrvwk",
  
  // Service inquiry responses - for service-specific inquiries
  serviceInquiryResponse: "https://formspree.io/f/maqajrly",
  
  // Mail to clients response - for admin direct messaging
  mailToClientsResponse: "https://formspree.io/f/xpqkrvwk",
} as const;

export const FORM_TYPES = {
  CONTACT_FORM: "contact-form-response",
  SERVICE_INQUIRY: "service-inquiry-response",
  MAIL_TO_CLIENT: "mail-to-clients-response",
} as const;

export type FormType = keyof typeof FORM_TYPES;
