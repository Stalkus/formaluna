# Forma Luna - Backend Implementation Guide

This document is designed to guide an AI agent (like Cursor) in building the backend architecture for the Forma Luna web application. The frontend is built in React (Vite) and currently relies on static mock data.

## 1. Tech Stack Recommendations
- **Language/Framework**: Node.js with Express (or NestJS for more structure).
- **Database**: PostgreSQL (relational is best for structured product specs and related items).
- **ORM**: Prisma or TypeORM (Prisma recommended for fast schema iteration).
- **Authentication**: JWT (JSON Web Tokens) or a managed service like Supabase/Clerk for the Trade Portal (`/professionals/login`).
- **File Storage**: AWS S3, Cloudinary, or Supabase Storage for storing high-res product images, packshots, and PDF spec sheets.

## 2. Core Entities & Database Schema

Based on the frontend data structures (`MOCK_DB` and `NOVA_MOCK_DB`), the database requires the following core tables:

### A. `Product` Table
The central entity for all physical luminaires.
- `id` (UUID, Primary Key)
- `name` (String, e.g., "Aura Track Line")
- `category` (String, e.g., "Track", "Downlights", "Surface")
- `description` (Text)
- `packshot_url` (String, URL to primary product image)
- `lifestyle_url` (String, URL to environmental/contextual image)
- `is_nova_trade` (Boolean, flags if product belongs to the B2B Wholesale portal)
- `is_studio_project` (Boolean, flags if product belongs to the B2C Projects portal)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### B. `ProductSpecification` Table (One-to-One or JSONB)
Technical details for a product. Can be a separate relational table or a `JSONB` column on the `Product` table for flexibility.
- `product_id` (UUID, Foreign Key)
- `material` (String)
- `finish` (String)
- `light_source` (String)
- `dimming` (String)
- `environment` (String)
- `power` (String, e.g., "12W")
- `lumen_output` (String, e.g., "1050lm")
- `ip_rating` (String, e.g., "IP44")
- `warranty` (String)
- *(Note: Consider a JSONB column `specs` on the Product table since technical fields vary wildly between drivers, mirrors, and downlights).*

### C. `RelatedProduct` Table (Many-to-Many Self-Relation)
Handles the "Technical Compatibilities" and "Curated Complementary Pieces" sections.
- `product_id` (UUID, Foreign Key)
- `related_product_id` (UUID, Foreign Key)

### D. `Project` Table
For the Case Studies/Projects Archive (`ProjectsArchivePage.tsx`).
- `id` (UUID, Primary Key)
- `title` (String, e.g., "Galeria Unico Iconico Co")
- `category_tags` (String, e.g., "INDOOR / CLOTHING RETAIL")
- `cover_image_url` (String)
- `description` (Text)
- `gallery_urls` (Array of Strings)

### E. `TradeUser` (Professional Portal)
For accessing "Login to see pricing" and the `/professionals/login` route.
- `id` (UUID, Primary Key)
- `company_name` (String)
- `vat_number` (String)
- `email` (String, unique)
- `password_hash` (String)
- `pricing_tier` (String, e.g., "Tier 1", "Distributor")

## 3. Required API Routes (RESTFul)

Base URL: `/api/v1`

### Products (Public & Trade)
- `GET /products` 
  - *Query Params:* `?portal=studio` or `?portal=nova`
  - *Query Params:* `?category=Downlights`
- `GET /products/:id` - Returns single product + parsed `specs` + nested `relatedProducts` array.

### Projects Archive
- `GET /projects` - Returns all case studies for the grid.
- `GET /projects/:id` - Returns full project details and gallery.

### Trade Portal / Authentication
- `POST /auth/login` - Authenticates professional users, returns JWT.
- `GET /trade/pricing/:product_id` - (Protected Route) Returns specific trade pricing for a logged-in user tier.
- `POST /trade/quote-request` - Submits a cart/list of items to generate a formal quotation (`QuotationTemplatePage.tsx`).

## 4. Frontend Integration Steps

Once the backend is live, the React frontend must be updated to consume the APIs:

1. **Remove Mock Data:** Delete the `MOCK_DB`, `NOVA_MOCK_DB`, `PROJECTS`, and `CATEGORIES` arrays currently hardcoded in the `.tsx` files.
2. **Add Data Fetching:** Implement `axios` or native `fetch` (preferably wrapped in a tool like TanStack React Query for caching) inside `useEffect` hooks on the relevant pages (`NovaProductsPage`, `ProjectProductDetailPage`, etc.).
3. **Loading States:** Add Skeleton loaders or spinners (`isLoading` state) in the UI while awaiting the API responses.
4. **Auth Context:** Create a React Context (`AuthContext.tsx`) to manage the JWT token and user session for the trade portal, conditionally rendering the "Login to see pricing" vs actual prices.

## 5. Deployment Considerations
- Store all sensitive environment variables (Database URIs, JWT Secrets) in an `.env` file.
- Implement strict CORS policies on the backend to only accept requests from the deployed frontend domain (e.g., `https://formaluna.com`).
