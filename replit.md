# EcoRide - Carpooling Platform

## Overview

EcoRide is a sustainable carpooling web application that connects drivers and passengers to share rides, reduce carbon footprint, and save on transportation costs. The platform features user authentication, ride management, booking requests with approval workflow, real-time notifications, and administrative controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React with TypeScript, Vite build tool, Tailwind CSS with shadcn/ui component library, Wouter for routing, TanStack Query for data fetching.

**Design Pattern**: Single-page application (SPA) with component-based architecture. The frontend is being migrated from a vanilla JavaScript multi-page application to a modern React stack.

**Rationale**: React provides a component-driven development model that enables reusable UI elements and better state management. TypeScript adds type safety, reducing runtime errors. Vite offers fast development builds and hot module replacement. Tailwind CSS enables utility-first styling with a consistent design system through shadcn/ui components.

**Key Design Decisions**:
- **shadcn/ui Integration**: Uses the "New York" style variant with CSS variables for theming, enabling dark mode support and consistent design tokens
- **Path Aliases**: Configured for clean imports (`@/components`, `@/lib`, `@shared`) improving code organization
- **Responsive Design**: Mobile-first approach with breakpoints defined in Tailwind config
- **Status-Driven UI**: Color-coded system for booking statuses (pending, accepted, rejected, completed) as defined in design guidelines

**Legacy Frontend**: The repository contains a legacy vanilla JavaScript implementation in the `/frontend` directory using Bootstrap 5, which is being replaced by the React implementation in `/client`.

### Backend Architecture

**Technology Stack**: Node.js with Express.js framework, following RESTful API patterns.

**Design Pattern**: MVC (Model-View-Controller) with route-based organization. The backend separates concerns into models (data schemas), controllers (business logic), routes (endpoint definitions), and middleware (authentication, authorization).

**Rationale**: Express provides a lightweight foundation for REST APIs. The MVC pattern ensures clear separation of concerns. JWT-based authentication offers stateless session management suitable for modern SPAs.

**Core API Endpoints**:
- `/api/auth` - User registration, login, profile retrieval
- `/api/users` - User CRUD operations (admin and self-service)
- `/api/rides` - Ride creation, search, booking management, reviews
- `/api/notifications` - Notification delivery and read status tracking

**Authentication Flow**: JWT tokens stored in localStorage on client, sent via Authorization header, verified by middleware on protected routes. Role-based access control distinguishes between regular users and administrators.

**Migration Status**: The backend currently uses the legacy Express server (`server.js` in root) with MongoDB/Mongoose. A new TypeScript-based Express server is being scaffolded in `/server` with a memory storage interface that will be replaced with a proper database implementation.

### Data Storage

**Current Implementation**: MongoDB with Mongoose ODM for schema validation and relationship management.

**Data Models**:
- **User**: Authentication credentials, profile information, role (user/admin)
- **Ride**: Driver reference, route details (from/to), schedule, pricing, passenger bookings with approval status, reviews
- **Notification**: User reference, notification type, message content, read status, related ride/requester references

**Key Schema Decisions**:
- Embedded passenger array in Ride model with booking status field (pending/accepted/rejected)
- Notification model with type enumeration for different event categories
- Indexed fields on frequently queried data (user email, ride dates, notification user+read status)
- Default admin user created on database initialization

**Planned Migration**: Configuration exists for Drizzle ORM with PostgreSQL (via `drizzle.config.ts` and basic schema in `shared/schema.ts`), indicating a planned migration to a SQL-based solution.

### External Dependencies

**Third-Party Services**:
- **Google Maps Distance Matrix API**: Used for calculating distances between origin and destination points in ride search functionality. API key configured via `GOOGLE_MAPS_API_KEY` environment variable.

**Frontend Libraries**:
- **shadcn/ui**: Pre-built accessible React components built on Radix UI primitives
- **Radix UI**: Unstyled, accessible component primitives (accordion, alert-dialog, avatar, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration
- **Lucide React**: Icon library
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing library
- **class-variance-authority (CVA)**: Utility for building variant-based component APIs

**Backend Libraries**:
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation and verification
- **cors**: Cross-origin resource sharing middleware
- **mongoose**: MongoDB object modeling

**Development Tools**:
- **Vite**: Build tool with plugins for React, runtime error overlay, Replit integration
- **TypeScript**: Type-safe JavaScript with strict mode enabled
- **Drizzle Kit**: Database migration tool (configured but not yet in use)

**API Integration Pattern**: Client uses a centralized `apiRequest` helper function that handles authentication headers, error responses, and JSON parsing. Unauthorized responses (401) can be configured to either throw or return null based on context.

**Environment Configuration**: 
- `DATABASE_URL` - PostgreSQL connection string (required for Drizzle, currently throws if missing)
- `MONGODB_URI` - MongoDB connection string (defaults to localhost for current implementation)
- `JWT_SECRET` - Secret key for JWT signing (has fallback for development)
- `GOOGLE_MAPS_API_KEY` - Google Maps API access