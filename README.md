# E-commerce SaaS Platform

A comprehensive multi-tenant e-commerce platform designed to be offered as Software as a Service (SaaS) for merchants selling products and services.

## Architecture Overview

### Backend (Render)
- **Framework**: Node.js with NestJS
- **Databases**: PostgreSQL for relational data and MongoDB for document-based data
- **Architecture**: Microservices
- **API**: RESTful with JWT authentication
- **Payment Processing**: Asaas integration for payments and subscriptions
- **Hosting**: Render

### Frontend (Vercel)
- **Framework**: Next.js
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **PWA Support**: Responsive design with Progressive Web App capabilities
- **Hosting**: Vercel

## Core Features

### Admin Dashboard (Platform Owner)
- Merchant management
- Subscription and payment management
- Automatic store blocking/unblocking for overdue accounts
- Analytics dashboards
- Plan configuration and management

### Merchant Portal
- Brand customization
- Product and service management
- Checkout customization
- Tax settings
- Third-party integrations

### Catalog Management
- Support for physical products, digital goods, and services
- Dynamic attributes
- Bulk import/export
- Advanced SEO

### Sales and Checkout
- Smart cart
- Delivery or scheduling options
- Dynamic pricing calculator
- Cross-selling and upselling recommendations

### Financial Management
- Asaas integration for payments and subscriptions
- Payment splitting
- Financial reports
- Commission management

### Marketing Tools
- Integrated email marketing
- Loyalty programs
- Coupon management
- Abandoned cart recovery

### Security
- LGPD/GDPR compliance
- Automated backups
- Action auditing
- Granular permissions

### Scheduling System
- Interactive calendar
- Availability management
- Online and in-store booking
- Service customization
- Automatic reminders
- Digital check-in
- Schedule optimization
- Analytical reports

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Docker and Docker Compose
- PostgreSQL
- MongoDB
- Asaas account

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run start:dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Configure environment variables
npm run dev
```

## Deployment

### Backend (Render)
The backend microservices are deployed to Render with automatic scaling based on load.

### Frontend (Vercel)
The frontend applications are deployed to Vercel with automatic preview deployments for each PR.

## Security Best Practices
- JWT with proper expiration and refresh tokens
- HTTPS only
- API rate limiting
- Data encryption at rest
- Input validation and sanitization
- Regular security audits
- OWASP Top 10 compliance
