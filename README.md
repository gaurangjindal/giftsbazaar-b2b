# B2B Wholesale Catalogue

A robust, full-stack web application designed for wholesale distributors to manage massive product catalogs and provide a premium storefront for retail buyers.

## Architecture

This project is decoupled into two parts:
1. **Frontend (`/`)**: A React 19 Single Page Application built with Vite.
2. **Backend (`/server`)**: A Node.js Express REST API connected to MongoDB Atlas and AWS S3.

### Tech Stack
*   **Frontend**: React, Vite, Lucide React (Icons), Vanilla CSS (Custom Design System).
*   **Backend**: Node.js, Express, Mongoose, Multer, Sharp.
*   **Database**: MongoDB Atlas (Cloud).
*   **Media Storage**: Amazon S3 (with automatic server-side image compression).

## Key Features

*   **Premium Storefront**: A fast, responsive, and minimalist UI for buyers to browse products and build bulk orders.
*   **Admin Dashboard**: Secure portal for distributors to manage inventory, categories, and vendors.
*   **Lightning Fast Caching**: The backend features a custom in-memory cache that serves the catalog instantly, automatically invalidating when admins make updates.
*   **Smart Image Optimization**: Uploaded images are automatically intercepted, resized (max 1000px), and converted to highly compressed `.webp` format before being uploaded to AWS S3, reducing storage and bandwidth costs by up to 98%. Non-image files (videos, PDFs) safely bypass compression.

## Local Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Duplicate the `.env.example` file and rename it to `.env`.
4. Fill in your MongoDB Atlas connection string and AWS credentials in `.env`.
5. Start the development server: `npm run dev` (Runs on port 5001)

### 2. Frontend Setup
1. Open a new terminal and navigate to the root directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. The frontend will be available at `http://localhost:5173`.

> **Note:** The frontend relies on the backend API. Ensure the backend is running before accessing the frontend. By default, the frontend connects to `http://localhost:5001/api`.

## Deployment
For production deployment instructions, please read [DEPLOYMENT.md](./DEPLOYMENT.md).
