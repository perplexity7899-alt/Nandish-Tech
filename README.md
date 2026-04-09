# Nandish-Tech -Website

A modern, full-featured portfolio website built with React, TypeScript, and Tailwind CSS. Showcasing full-stack development and design services with an integrated client dashboard and admin management system.

## 🌟 Features

### Public Portfolio
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Hero Section**: Eye-catching landing section with CTA
- **About Section**: Professional introduction and expertise showcase
- **Services Section**: Detailed service offerings with descriptions
- **Projects Portfolio**: Dynamic project showcase with filters and details
- **Contact Section**: Contact form for inquiries
- **Modern UI**: Gradient designs, smooth animations, and micro-interactions

### Client Dashboard
- **Project Management**: View and track project deliverables
- **Client Onboarding**: Secure authentication and profile management
- **Payment Integration**: Razorpay payment gateway integration
- **Real-time Updates**: Live project status tracking
- **Responsive Interface**: Works seamlessly on all devices

### Admin Panel
- **Complete Dashboard**: Overview of all projects, clients, and services
- **Client Management**: CRUD operations for client profiles
- **Project Management**: Create, update, and manage projects
- **Service Management**: Manage service offerings
- **Payment Tracking**: Monitor and manage transactions
- **Content Management**: Update portfolio and about sections
- **Analytics**: View project statistics and client information

### Technical Features
- **Authentication**: Secure user authentication with Supabase
- **Database**: PostgreSQL with Supabase backend
- **Real-time Updates**: Supabase RLS (Row Level Security) for data protection
- **Payment Processing**: Razorpay integration for secure payments
- **API Integration**: RESTful API for client operations
- **Testing**: Vitest and Playwright for comprehensive testing

## 🛠 Tech Stack

### Frontend
- **React 18**: UI library with hooks
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: High-quality React components
- **Lucide React**: Beautiful icon library
- **React Router**: Client-side routing
- **React Hook Form**: Efficient form handling
- **Zod**: TypeScript-first schema validation
- **Sonner**: Toast notifications
- **Recharts**: Data visualization

### Backend & Database
- **Supabase**: PostgreSQL database + authentication
- **PostgreSQL**: Relational database
- **Row Level Security (RLS)**: Data protection policies
- **Stored Functions**: Custom database functions

### Payment & Integration
- **Razorpay**: Payment gateway integration
- **Razorpay Checkout**: Secure payment forms

### Testing & Development
- **Vitest**: Unit and integration testing
- **Playwright**: E2E testing
- **ESLint**: Code quality
- **PostCSS**: CSS processing

```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm/Bun package manager
- Supabase account
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Nandish-Tech-Website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Razorpay Configuration
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

   # Application Settings
   VITE_API_URL=http://localhost:8080
   ```

4. **Database Setup**
   - Create a Supabase project
   - Run migrations from `supabase/migrations/` directory
   - Execute SQL scripts in order:
     - `SETUP_ABOUT_TABLE.sql`
     - `SETUP_SERVICES_TABLE.sql`
     - `SETUP_PROJECTS_TABLE.sql`
     - `SETUP_CLIENT_PROJECTS_TABLE.sql`
     - `SETUP_PROJECT_DELIVERIES_TABLE.sql`
     - `SETUP_REPLIES_TABLE.sql`
     - `20260407_create_payment_system.sql`

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```
   
   The application will be available at `http://localhost:8080`

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm run build:dev        # Build in development mode
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run ESLint
```

## 🗄 Database Schema

### Tables
- **profiles**: User profiles and authentication
- **about**: About section content
- **services**: Service offerings
- **projects**: Portfolio projects
- **client_projects**: Client-specific projects
- **project_deliverables**: Project delivery tracking
- **project_replies**: Communication/feedback on projects
- **payment_records**: Payment transaction history
- **invoices**: Invoice management

### Key Features
- Row Level Security (RLS) policies for data protection
- Automatic timestamps (created_at, updated_at)
- Foreign key relationships for data integrity
- Soft delete support where applicable

## 🔐 Authentication & Security

- **Email/Password Auth**: Secure user registration and login
- **JWT Tokens**: Secure session management
- **RLS Policies**: Database-level access control
- **Protected Routes**: Client and admin routes require authentication
- **Environment Variables**: Sensitive data protection

## 💳 Payment Integration

### Razorpay Setup
1. Sign up at [Razorpay](https://razorpay.com)
2. Get your Key ID and Secret
3. Add credentials to `.env`
4. Test with Razorpay test cards:
   - Card: 4111111111111111
   - Expiry: 12/25
   - CVV: 123

### Payment Flow
1. User initiates payment
2. Razorpay checkout modal opens
3. Payment processed securely
4. Webhook callback updates database
5. Payment confirmation sent to user

## 🎨 Design System

### Colors
- **Primary**: Teal/Green (#16a34a)
- **Accent**: Secondary accent color
- **Background**: Dark theme support
- **Muted**: Secondary text colors

### Components
All UI components are built using Shadcn/UI and customized with Tailwind CSS:
- Buttons (variants: default, outline, ghost, destructive)
- Forms (input, select, checkbox, radio)
- Cards, Modals, Dialogs
- Tables, Badges, Alerts
- Navigation, Dropdowns

## 🔧 Configuration Files

- `vite.config.ts`: Vite configuration with React SWC
- `tailwind.config.ts`: Tailwind CSS customization
- `tsconfig.json`: TypeScript configuration
- `playwright.config.ts`: E2E testing configuration
- `vitest.config.ts`: Unit testing configuration
- `components.json`: Shadcn/UI configuration

## 📱 Responsive Design

- **Mobile**: 320px and up (optimized for small screens)
- **Tablet**: 768px (md breakpoint)
- **Desktop**: 1024px and up (lg breakpoint)
- **Large Desktop**: 1280px and up (xl breakpoint)

## 🧪 Testing

### Unit Tests
```bash
npm run test
```
- Located in `src/test/`
- Uses Vitest
- Coverage for utilities and hooks

### E2E Tests
```bash
npm run test:watch
```
- Uses Playwright
- Tests complete user flows
- Configuration in `playwright.config.ts`

## 🚢 Deployment

### Vercel
1. Connect GitHub repository
2. Configure environment variables
3. Deploy with `npm run build`

### Other Platforms
1. Build: `npm run build`
2. Serve: `npm run preview`
3. Upload `dist/` folder to hosting

## 📖 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh tokens

### Projects
- `GET /projects` - Get all projects
- `GET /projects/:id` - Get project details
- `POST /projects` - Create project (Admin)
- `PUT /projects/:id` - Update project (Admin)
- `DELETE /projects/:id` - Delete project (Admin)

### Clients
- `GET /clients` - Get all clients (Admin)
- `GET /clients/:id` - Get client details
- `POST /clients` - Create client (Admin)
- `PUT /clients/:id` - Update client (Admin)

### Services
- `GET /services` - Get all services
- `POST /services` - Create service (Admin)
- `PUT /services/:id` - Update service (Admin)

### Payments
- `POST /payments/initiate` - Initialize payment
- `POST /payments/verify` - Verify payment
- `GET /payments/:id` - Get payment details

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.ts or use:
PORT=3000 npm run dev
```

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check database migrations are applied
- Ensure RLS policies are correct

### Payment Integration Issues
- Verify Razorpay credentials
- Check webhook configuration
- Review browser console for errors

### CORS Issues
- Ensure Supabase URL is correct
- Check allowed origins in Supabase

## 📝 Environment Variables Reference

```env
# Required for Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Required for Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Optional
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Nandish-Tech
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test`
4. Run linter: `npm run lint`
5. Submit pull request

## 📄 License

This project is private and confidential.

## 👨‍💻 Author

**Nandish**  
Full Stack Developer & Designer  
Building digital experiences that matter.

---

## 📞 Support

For issues, feature requests, or questions:
- Create an issue in the repository
- Contact: [your-contact@nandish-tech.com]
- Website: [nandish-tech.com]

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Complete portfolio website
- Client dashboard
- Admin panel
- Payment integration
- Responsive design

---

**Last Updated**: April 2026  
**Status**: Active Development
