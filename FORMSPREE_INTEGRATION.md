# Formspree Integration Guide

## Overview
This guide explains how to use the Formspree email response system for your contact forms.

**Formspree Endpoint:** https://formspree.io/f/xpqkrvwk

---

## Files Created

### 1. `src/config/formspreeConfig.ts`
- Configuration file with Formspree endpoints
- Contains form type constants
- Export: `FORMSPREE_ENDPOINTS`, `FORM_TYPES`

### 2. `src/utils/formspreeSubmit.ts`
- Utility functions to submit responses to Formspree
- Three specialized functions for different form types
- Returns success/failure status

---

## How to Use

### **Option 1: Generic Function**
For custom form submissions:

```typescript
import { submitFormspreeResponse } from "@/utils/formspreeSubmit";

const result = await submitFormspreeResponse("contact-form", {
  admin_name: "John Doe",
  subject: "Re: Your Inquiry",
  message: "Thank you for contacting us...",
  client_email: "client@example.com",
  priority: "normal",
});

if (result.ok) {
  console.log("Email sent successfully!");
} else {
  console.error("Error:", result.message);
}
```

### **Option 2: Contact Form Response**
For responding to general contact inquiries:

```typescript
import { submitContactFormResponse } from "@/utils/formspreeSubmit";

const result = await submitContactFormResponse({
  adminName: "John Doe",
  responseSubject: "Re: Your Inquiry",
  responseMessage: "We received your message and will get back to you soon.",
  clientEmail: "client@example.com",
  priority: "normal",
});
```

### **Option 3: Service Inquiry Response**
For responding to service-specific inquiries:

```typescript
import { submitServiceInquiryResponse } from "@/utils/formspreeSubmit";

const result = await submitServiceInquiryResponse({
  adminName: "John Doe",
  serviceType: "Website Development",
  responseSubject: "Quote for Your Project",
  responseMessage: "Based on your requirements, here's our proposal...",
  clientEmail: "client@example.com",
  timeline: "2-3 weeks",
  priority: "urgent",
});
```

### **Option 4: Mail to Client Response**
For admin direct messaging:

```typescript
import { submitMailToClientResponse } from "@/utils/formspreeSubmit";

const result = await submitMailToClientResponse({
  adminName: "John Doe",
  subject: "Project Update",
  messageBody: "Your project is 50% complete...",
  recipientEmail: "client@example.com",
  priority: "normal",
});
```

---

## Integration Points

### In AdminMailManager Component
When admin sends a message:

```typescript
import { submitMailToClientResponse } from "@/utils/formspreeSubmit";

const handleSendMessage = async () => {
  // Existing code to save to database...
  
  // NEW: Send email via Formspree
  const emailResult = await submitMailToClientResponse({
    adminName: currentAdmin.name,
    subject: formData.subject,
    messageBody: formData.message,
    recipientEmail: selectedUser.email,
    priority: "normal",
  });

  if (emailResult.ok) {
    toast.success("Email sent to client!");
  }
};
```

### In CustomProjectReplies Component
When responding to an inquiry:

```typescript
import { submitServiceInquiryResponse } from "@/utils/formspreeSubmit";

const handleSendResponse = async () => {
  const result = await submitServiceInquiryResponse({
    adminName: adminName,
    serviceType: selectedReply.service_type,
    responseSubject: responseSubject,
    responseMessage: responseMessage,
    clientEmail: selectedReply.client_email,
    priority: "normal",
  });

  if (result.ok) {
    toast.success("Response email sent!");
  }
};
```

---

## Response Object

All functions return:

```typescript
{
  ok: boolean;           // true if successful, false otherwise
  status: number;        // HTTP status code
  message?: string;      // Status message
}
```

---

## Email Fields Sent to Formspree

### Contact Form Response
- `admin_name` - Name of admin responding
- `subject` - Email subject
- `message` - Response message
- `client_email` - Client's email address
- `priority` - Task priority

### Service Inquiry Response
- `admin_name` - Name of admin responding
- `service_type` - Type of service
- `subject` - Email subject
- `message` - Response message
- `client_email` - Client's email address
- `timeline` - Project timeline
- `priority` - Task priority

### Mail to Client Response
- `admin_name` - Name of admin
- `subject` - Email subject
- `message` - Message body
- `recipient_email` - Recipient's email
- `priority` - Message priority

---

## Error Handling

```typescript
const result = await submitFormspreeResponse("contact-form", data);

if (!result.ok) {
  console.error(`Error (${result.status}): ${result.message}`);
  toast.error("Failed to send email. Please try again.");
} else {
  toast.success("Email sent successfully!");
}
```

---

## Notes

- ✅ All three form types use the same Formspree endpoint
- ✅ No database changes needed
- ✅ Emails are sent instantly
- ✅ Formspree handles email delivery and tracking
- ✅ No existing code was modified
- ✅ Non-blocking - form won't fail if email fails

---

## Next Steps

1. Import the appropriate function where you need it
2. Call it with the required data
3. Handle the response with success/error toast messages
4. Optional: Update database with response status after successful email

---

## Support

For Formspree documentation: https://formspree.io/
