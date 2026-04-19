# Client Replies System - Implementation Guide

## Overview
A complete system for tracking client inquiries from different forms (Contact Form and Service-Specific Forms) with separate reply management.

## Database Schema

### client_replies Table
- **id**: UUID (Primary Key)
- **message_id**: UUID (References messages.id) - Links to the original inquiry
- **user_id**: UUID (References auth.users.id) - The person who made the inquiry
- **admin_id**: UUID (References auth.users.id) - The admin who replied
- **reply_message**: TEXT - The admin's response
- **service_type**: VARCHAR(100) - Type of service/form (e.g., "contact-form", "website-development", "landing-pages")
- **inquiry_type**: VARCHAR(50) - Type of inquiry ("general", "service-inquiry", "project-follow-up")
- **read_by_user**: BOOLEAN - Whether the user has read this reply
- **read_at**: TIMESTAMP - When the user read the reply
- **created_at**: TIMESTAMP - When the reply was created
- **updated_at**: TIMESTAMP - Last update timestamp

### Enhanced messages Table
- **service_type**: VARCHAR(100) - Type of service/form the inquiry came from
- **inquiry_type**: VARCHAR(50) - General, service-inquiry, or project-follow-up
- **last_name**: TEXT - Client's last name

## How It Works

### 1. Contact Form (ContactSection.tsx)
When a user submits the general contact form:
```typescript
{
  service_type: "contact-form",
  inquiry_type: "general",
  // ... other fields
}
```

### 2. Service-Specific Forms (ServiceContactForm.tsx)
When a user clicks "Get Started" on a service:
```typescript
{
  service_type: "website-development", // or "landing-pages", "ai-chatbot", etc.
  inquiry_type: "service-inquiry",
  // ... other fields
}
```

### 3. Admin Replies
Admins can reply to messages:
- They create an entry in `client_replies` table
- The reply is linked to the original message via `message_id`
- Service type is tracked for filtering and organization
- User gets notified of new replies (via toast/real-time subscription)

### 4. Client Views Replies
Users can see all their replies:
- Component: `ClientRepliesDisplay.tsx`
- Hook: `useClientMessages.ts` for filtering by service
- Real-time updates via Supabase subscriptions
- Unread count display

## RLS Policies

### Users Can:
- View replies to their own messages
- Mark replies as read
- Cannot delete or modify replies

### Admins Can:
- View all messages and replies
- Create replies to any message
- Update their own replies
- Delete replies

## Files Created/Modified

### New Files:
1. `/supabase/migrations/20260420_create_client_replies_table.sql`
   - Creates client_replies table
   - Sets up RLS policies
   - Adds indexes for performance
   - Adds columns to messages table

2. `/src/components/client/ClientRepliesDisplay.tsx`
   - Component to display all client replies
   - Shows unread count
   - Real-time subscription for new replies
   - Formats service type and timestamps

3. `/src/hooks/useClientMessages.ts`
   - Hook to fetch messages
   - Optional filtering by service type
   - Real-time subscription
   - Error handling

### Modified Files:
1. `/src/components/portfolio/ContactSection.tsx`
   - Added `service_type: "contact-form"`
   - Added `inquiry_type: "general"`

2. `/src/components/portfolio/ServiceContactForm.tsx`
   - Added `service_type` (converted from service title)
   - Added `inquiry_type: "service-inquiry"`

## Isolation & Safety

✅ **Contact Form** is completely separate from Service Forms
✅ **Each service form** has its own tracking
✅ **No interference** between different form types
✅ **Service type filtering** allows viewing specific inquiry types
✅ **User isolation** - Users only see their own replies
✅ **Admin isolation** - Admins can see all but modify only their own replies

## Usage Examples

### Get all messages for a user:
```typescript
const { messages } = useClientMessages();
```

### Get only website development inquiries:
```typescript
const { messages } = useClientMessages("website-development");
```

### Display client replies:
```typescript
<ClientRepliesDisplay />
```

## Service Type Values

- `contact-form` - General contact form
- `website-development` - Website Development service
- `landing-pages` - Landing Pages service
- `ai-chatbot` - AI Chatbot Integration service
- `full-stack-development` - Full Stack Development service
- `custom-project` - Custom Project service
