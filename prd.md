# Product Requirements Document (PRD): B2B Wholesale Catalogue Platform

## 1. Project Overview
**Name:** Gift Décor B2B Wholesale Catalogue
**Description:** A responsive, single-page web application (SPA) designed to serve as a digital B2B catalog. The platform allows wholesale distributors (admins) to easily upload and manage massive product catalogs via CSV or manual entry, and provides retailers (customers) with a premium, beautifully designed storefront to browse products and place wholesale orders.

## 2. Target Audience
1. **Admins (Wholesalers/Distributors):** Need a fast way to update thousands of products at once (via CSV) and control exactly which data fields are visible to buyers.
2. **Customers (Retailers/Buyers):** Need a clean, professional, fast-loading interface to browse high-ticket items, view detailed pricing (Cost vs. Selling vs. MRP), and build a bulk order cart.

## 3. Core Architecture
- **Frontend Framework:** React 18 (via Vite)
- **State Management:** React Context API (`AppContext`, `AuthContext`)
- **Routing:** React Router DOM
- **Data Persistence:** Client-side local storage (`localStorage`) for rapid prototyping and offline capabilities.
- **Styling:** Custom Vanilla CSS (`index.css`) utilizing CSS Variables for a clean, minimal light theme.
- **CSV Parsing:** PapaParse (client-side processing)
- **Icons:** Lucide React

## 4. Key Features & Requirements

### 4.1. Authentication System
- **Simulated Login:** A secure entry point for the Admin Portal.
- **Access Control:** Unauthenticated users can only view the Customer Storefront. Only authenticated admins can access the `/admin` routes.

### 4.2. Admin Portal (Management Dashboard)
- **Bulk CSV Upload:** Drag-and-drop interface to upload massive CSV files (1000+ rows). Parses data locally without server lag.
- **Manual Product Entry & Suggestion Engine:** A comprehensive form allowing admins to add one-off products manually. Includes a "Suggest" feature that uses keyword matching to help admins quickly map products to managed categories.
- **Category Management:** Full administrative control over storefront visibility via a dedicated Categories tab. Admins can create, edit, delete, and toggle the status of categories. Setting a category to "draft" automatically hides all associated products from the storefront.
- **Vendor Management:** A dedicated vendor section that automatically aggregates unique vendors based on the `pickup address code` or `Vendor Code` field in the product data, displaying total product counts per vendor. The dashboard analytics track the total number of active vendors dynamically.
- **Field Visibility Toggles:** A dynamic control panel where admins can toggle the visibility of specific product attributes (e.g., hiding "Cost Price" from retail buyers, or showing "MRP").
- **Product Data Table:** A searchable, paginated table summarizing the current catalog. It includes advanced filtering features, such as a custom multi-select dropdown with visual checkboxes to filter products by specific vendors, alongside category and status filters.

### 4.3. Customer Storefront
- **Premium Light Theme Design:** A minimalist, professional UI featuring white backgrounds, thin borders, and elegant typography (Playfair Display for headings, Inter for data).
- **Category Navigation:** A row of filter pills (e.g., Animals, Bird, Buddha) representing the admin-managed category system. Categories set to 'draft' are hidden, allowing granular control over storefront visibility.
- **Advanced Product Cards:** 
  - Floating badges (VIDEO indicator, favorite heart, Product Code tag).
  - Image carousel indicators.
  - Dynamic dimension strings constructed from `Packaging Length/Breadth/Height`.
  - A comprehensive 3-column pricing grid displaying Cost, Selling, and MRP (with strikethrough).
  - Hover-activated "Add to Order" overlay to keep the default view uncluttered.
- **Storefront Controls & Pagination:** A streamlined control bar organized on the right side offering standard pagination (default 50 products per page, scalable up to 250), sorting options, and grid/list view toggles to handle high product volume gracefully.
- **Slide-out Shopping Cart:** A non-intrusive cart overlay allowing users to adjust quantities, remove items, and view total order costs in real-time.

## 5. Data Schema & Integration
The application is built to handle a complex, high-density CSV structure. Key fields mapped in the application include:
- `Name`: Primary product title.
- `Product Code` / `Sku Id`: Unique identifiers used for React keys and cart logic.
- `Selling Price` / `MRP` / `Cost Price`: Comprehensive pricing tiers.
- `Quantity`: Used to calculate "In Stock" status.
- `Packaging Length (in cm)`, `Breadth`, `Height`: Used to construct the dynamic dimension strings on the product cards.
- `Image 1`: Mapped to the primary product `imageUrl` (with intelligent fallback handling).
- `attr_Theme` / `Product Type`: Used for dynamic category generation on the storefront.

## 6. Future Roadmap (Post-Prototype)
1. **Backend Integration:** Replace `localStorage` with a robust backend database (e.g., PostgreSQL or MongoDB) and a dedicated API (Node.js/Express or Python/Django).
2. **Real Authentication:** Implement JWT-based authentication via Firebase Auth or Auth0.
3. **Cloud Object Storage:** Directly integrate with Amazon S3 or Cloudinary for secure, scalable image and video hosting.
4. **Checkout Integration:** Connect the Shopping Cart to a B2B invoicing system or payment gateway (e.g., Stripe, Razorpay).
5. **Advanced Filtering:** Add multi-select faceted search (e.g., filter by Color AND Category AND Price Range).
