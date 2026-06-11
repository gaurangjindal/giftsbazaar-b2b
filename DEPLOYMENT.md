# Deployment & Hosting Guide: B2B Wholesale Catalogue

This guide provides step-by-step instructions for setting up the cloud database, configuring file storage, and hosting both the backend server and frontend client for production.

---

## Architecture Blueprint

*   **Database**: MongoDB Atlas (Managed Cloud Database)
*   **Media Storage**: Amazon S3 (Image & file storage)
*   **Backend Server**: Render / Heroku / AWS Elastic Beanstalk (Node.js/Express service)
*   **Frontend Client**: Vercel / Netlify / AWS Amplify (Static host optimized for Single Page Apps)

---

## Phase 1: MongoDB Database Setup (MongoDB Atlas)

MongoDB Atlas is a fully managed cloud database service. We will use their free tier cluster.

1.  **Create an Account**:
    *   Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  **Create a New Cluster**:
    *   Click **Create** -> Select **M0 (Free)** cluster.
    *   Choose a cloud provider (e.g., AWS) and select your nearest region.
    *   Click **Create Deployment**.
3.  **Configure Security and Credentials**:
    *   **Database User**: Set up a username and a strong password. Save these credentials.
    *   **Network Access / IP Access List**: Add a rule. Since your server will run on a PaaS hosting service (like Render) with dynamic IPs, add `0.0.0.0/0` (allow access from anywhere). 
    *   *Note: Secure the access list in production using private networking or VPC Peering if supported.*
4.  **Retrieve Connection String**:
    *   In the Atlas Dashboard, go to **Database** -> Click **Connect**.
    *   Choose **Drivers** (Node.js).
    *   Copy the connection string. It will look like:
        ```
        mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
        ```
    *   Replace `<username>` and `<password>` with the credentials you created in Step 3.

---

## Phase 2: Media Storage Setup (Amazon S3)

The application uses Amazon S3 to store uploaded catalog images. 
*Note: The backend automatically intercepts uploaded images, resizes them (max 1000px), and converts them to `.webp` format using the `sharp` library before sending them to S3 to save storage and bandwidth.*

1.  **Create an AWS Account**:
    *   Sign up at [aws.amazon.com](https://aws.amazon.com/).
2.  **Create an S3 Bucket**:
    *   Navigate to the **S3 Console** -> Click **Create Bucket**.
    *   Enter a unique bucket name and select your region.
    *   Under **Object Ownership**, enable **ACLs enabled** and select **Bucket owner preferred** (needed for `public-read` access of uploaded images).
    *   Under **Block Public Access settings**, *uncheck* **Block all public access** (since buyers need to view product images publicly via URL).
    *   Acknowledge the warning and click **Create Bucket**.
3.  **Configure Bucket CORS Policy** (Optional but recommended):
    *   Go to your bucket -> **Permissions** tab -> Scroll to **Cross-origin resource sharing (CORS)**.
    *   Click **Edit** and paste the following configuration:
        ```json
        [
          {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": []
          }
        ]
        ```
4.  **Create IAM User and Access Credentials**:
    *   Go to **IAM** (Identity and Access Management) console -> **Users** -> **Create user**.
    *   Choose a name (e.g., `b2b-catalog-uploader`).
    *   Under **Set permissions**, select **Attach policies directly** and choose **AmazonS3FullAccess** (or create a custom policy restricting access to just your bucket).
    *   Create the user.
    *   Click on the user you just created -> Go to **Security credentials** tab -> Scroll to **Access keys** -> Click **Create access key**.
    *   Select **Local code** or **Other**, acknowledge warnings, and click **Next**.
    *   Copy your **AWS_ACCESS_KEY_ID** and **AWS_SECRET_ACCESS_KEY**. *Keep them safe!*

---

## Phase 3: Backend Deployment (Node.js/Express)

We will use **Render** as an example, but these steps apply similarly to Heroku or Railway.

1.  **Prepare the Code**:
    *   Ensure the [server/package.json](file:///Users/mansukh/Documents/Anti-gravity/b2b%20catalogue%20/server/package.json) contains a start script: `"start": "node server.js"`.
    *   *Note: The backend relies on the `sharp` library for image compression. Ensure your hosting provider (like Render or Heroku) supports native Node.js addons.*
2.  **Create a Render Web Service**:
    *   Sign up at [Render](https://render.com/).
    *   Click **New** -> **Web Service**.
    *   Connect your GitHub repository.
    *   Configure settings:
        *   **Root Directory**: `server`
        *   **Runtime**: `Node`
        *   **Build Command**: `npm install`
        *   **Start Command**: `npm start`
3.  **Configure Environment Variables**:
    *   Copy the keys from `server/.env.example` and set them in the service's **Environment** tab:
        *   `MONGODB_URI`: *Your MongoDB Atlas connection string from Phase 1*
        *   `PORT`: `10000` (Render will override this, but it is good practice to supply a default)
        *   `AWS_ACCESS_KEY_ID`: *Your IAM Access Key*
        *   `AWS_SECRET_ACCESS_KEY`: *Your IAM Secret Access Key*
        *   `AWS_REGION`: *Your AWS region (e.g. us-east-1)*
        *   `AWS_BUCKET_NAME`: *Your S3 Bucket name*
        *   `NODE_ENV`: `production`
4.  **Deploy**:
    *   Click **Manual Deploy** -> **Clear Cache & Deploy**. Once running, Render will provide your public backend URL (e.g., `https://b2b-catalog-api.onrender.com`).

---

## Phase 4: Frontend Deployment (Vite/React)

The frontend needs to know where the deployed backend API is located. 

### Step 1: Support Dynamic Environment Variables in the Frontend

Update the frontend code to read the API URL from environment variables instead of hardcoding `localhost`.

1.  In the frontend codebase, locate the API base URL in [AppContext.jsx](file:///Users/mansukh/Documents/Anti-gravity/b2b%20catalogue%20/src/context/AppContext.jsx#L6).
2.  Update it to:
    ```javascript
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
    ```
3.  Create a local file `.env.local` inside your project root directory (next to `package.json`) and configure it for local runs:
    ```bash
    VITE_API_BASE_URL=http://localhost:5001/api
    ```

### Step 2: Deploy to Vercel/Netlify

1.  **Configure Static Host (e.g., Vercel)**:
    *   Go to [Vercel](https://vercel.com/) -> Click **Add New** -> **Project**.
    *   Import your repository.
2.  **Configure Settings**:
    *   **Framework Preset**: `Vite` (Vercel automatically detects this).
    *   **Root Directory**: `./` (or leave empty if it's the repository root).
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
3.  **Environment Variables**:
    *   Add an environment variable:
        *   Key: `VITE_API_BASE_URL`
        *   Value: *Your deployed backend service URL* (e.g., `https://b2b-catalog-api.onrender.com/api`)
4.  **Deploy**:
    *   Click **Deploy**.
    *   *Note: Because React Router DOM uses client-side routing, you might get 404 errors when reloading sub-pages. To fix this, create a file named `vercel.json` in the root folder with the following rewrite rule:*
        ```json
        {
          "rewrites": [{ "source": "/(.*)", "destination": "/" }]
        }
        ```
