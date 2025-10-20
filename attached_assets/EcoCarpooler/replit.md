# EcoRide - Carpooling Platform

## Overview

EcoRide is a sustainable carpooling web application that connects drivers and passengers to share rides, reduce carbon footprint, and save on transportation costs. The platform features user authentication with role-based access control (regular users and administrators), ride creation and search functionality, booking management, and a review system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: Vanilla JavaScript with Bootstrap 5 for UI components and Font Awesome for icons.

**Design Pattern**: Multi-page application (MPA) with separate HTML files for each major view (landing page, login, signup, user dashboard, admin dashboard). Static files are served directly by the Express backend.

**Rationale**: This approach provides a simple, straightforward architecture without the overhead of a frontend framework. Bootstrap ensures responsive design across devices, while the separation of concerns between pages makes the codebase easier to maintain for a small-to-medium application.

**Key Components**:
- **Landing Page** (`index.html`): Marketing and feature showcase
- **Authentication Pages** (`login.html`, `signup.html`): User registration and authentication
- **User Dashboard** (`dashboard-user.html`): Ride search, booking management, ride offering, and profile management
- **Admin Dashboard** (`dashboard-admin.html`): User and ride management interface

**Client-side JavaScript Modules**:
- `auth.js`: Authentication utilities and API request wrapper
- `dashboard.js`: User dashboard functionality including search, booking, and notifications
- `admin.js`: Administrative functions for managing users and rides

### Backend Architecture

**Technology Stack**: Node.js with Express.js framework, following a traditional MVC (Model-View-Controller) pattern.

**Design Pattern**: RESTful API architecture with route-based organization. The backend separates concerns into models (data schemas), controllers (business logic), routes (endpoint definitions), and middleware (authentication/authorization).

**Rationale**: Express provides a lightweight, flexible foundation for building REST APIs. The MVC pattern ensures clear separation of concerns, making the codebase maintainable and testable. RESTful design allows the API to be consumed by any client (web, mobile, etc.).

**Core Components**:

1. **Models** (`/models`):
   - `User.js`: User schema with name, email, password, role (user/admin), and phone
   - `Ride.js`: Ride schema with driver reference, route details, schedule, pricing, passenger bookings, and reviews

2. **Controllers** (`/controllers`):
   - `authController.js`: Handles signup, login, and profile retrieval with JWT token generation
   - `userController.js`: User CRUD operations (admin and self-service)
   - `rideController.js`: Ride creation, search, booking, cancellation, and review management

3. **Routes** (`/routes`):
   - `/api/auth`: Authentication endpoints (signup, login, profile)
   - `/api/users`: User management endpoints
   - `/api/rides`: Ride management and search endpoints

4. **Middleware** (`/middleware`):
   - `auth.js`: JWT token validation and user authentication
   - `adminAuth.js`: Admin role verification for protected endpoints

**Authentication Flow**: JWT-based stateless authentication. Passwords are hashed using bcryptjs before storage. Tokens are stored in localStorage on the client and sent via Authorization header for authenticated requests.

**Data Flow**: Client → Express Routes → Middleware (auth) → Controllers → Models → MongoDB → Response

### Data Storage

**Database**: MongoDB with Mongoose ODM (Object-Document Mapping).

**Rationale**: MongoDB's document-oriented structure naturally fits the application's data model, particularly for nested data like ride passengers and reviews. Mongoose provides schema validation, middleware hooks, and a convenient query API. The NoSQL approach allows flexibility for future feature additions without rigid schema migrations.

**Schema Highlights**:
- **Users**: Supports role-based access (user/admin) for authorization
- **Rides**: Embedded passenger bookings and reviews for efficient querying
- **Relationships**: References between rides and users using ObjectIds with Mongoose population

**Default Data**: The application automatically creates a default admin user (`admin@ecoride.com` / `Admin123`) on initial database connection to ensure immediate administrative access.

### Authentication & Authorization

**Authentication Mechanism**: JSON Web Tokens (JWT) with 24-hour expiration.

**Password Security**: Bcryptjs with salt rounds for one-way password hashing.

**Authorization Levels**:
- **Public**: Landing page, login, signup
- **Authenticated Users**: Ride search, booking, profile management, ride creation
- **Admin Only**: User management, all rides overview, user deletion

**Middleware Chain**: Route-level middleware validates tokens and checks user roles before granting access to protected endpoints.

**Rationale**: JWT provides stateless authentication suitable for REST APIs. Role-based access control (RBAC) with user/admin roles enables feature segmentation without complex permission systems.

### API Structure

**Convention**: RESTful endpoints following standard HTTP methods (GET, POST, PUT, DELETE).

**Response Format**: JSON with consistent structure (success data or error messages).

**Endpoint Organization**:
- Authentication: `/api/auth/*`
- User Management: `/api/users/*`
- Ride Operations: `/api/rides/*`

**Search Functionality**: Query parameter-based filtering for ride search (location, date, price range, available seats).

**Error Handling**: Centralized error responses with appropriate HTTP status codes (400 for validation, 401 for auth, 403 for authorization, 404 for not found, 500 for server errors).

## External Dependencies

### Third-party Libraries

**Backend**:
- `express`: Web application framework for routing and middleware
- `mongoose`: MongoDB ODM for data modeling and database interaction
- `bcryptjs`: Password hashing library for secure credential storage
- `jsonwebtoken`: JWT creation and verification for authentication
- `cors`: Cross-Origin Resource Sharing middleware for API access
- `dotenv`: Environment variable management for configuration

**Frontend**:
- `Bootstrap 5.1.3`: CSS framework for responsive UI components (loaded via CDN)
- `Font Awesome 6.0.0`: Icon library for visual elements (loaded via CDN)

### External Services

**MongoDB Database**: Primary data store for users, rides, bookings, and reviews. Connection string configured via `MONGODB_URI` environment variable (defaults to local MongoDB instance at `mongodb://localhost:27017/ecoride`).

**Environment Configuration**:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing (falls back to 'fallback_secret' if not set)
- `PORT`: Server port (defaults to 5000)

**Note**: The application currently uses local MongoDB but is designed to easily support cloud database services (MongoDB Atlas) via environment variable configuration.