# Artify - Deployment and Database Integration Guide

This guide provides the exact steps needed to link your frontend and backend to a MongoDB database and deploy both parts of the application to production hosting platforms.

---

## Part 1: Set Up MongoDB Atlas (Cloud Database)

Since your backend needs a live database in production, you should use **MongoDB Atlas** (a fully managed cloud database with a generous free tier).

1. **Sign Up / Log In**:
   - Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. **Create a Free Cluster**:
   - Click **Create Database**.
   - Select the **M0 Free** (Shared) tier.
   - Choose a cloud provider (e.g., AWS) and region nearest to you.
   - Click **Create**.
3. **Set Up Security (Database Access)**:
   - Create a database user.
   - Set a username (e.g., `artify-user`) and a secure password. *Write these credentials down.*
   - Click **Create User**.
4. **Configure Network Access**:
   - Go to the **Network Access** tab on the left sidebar.
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere** (IP `0.0.0.0/0`). This is necessary because hosting services like Render change their server IP addresses dynamically.
   - Click **Confirm**.
5. **Get your Connection String**:
   - Go to the **Database** tab.
   - Click **Connect** next to your cluster.
   - Select **Drivers** under "Connect to your application".
   - Copy the connection string. it will look like this:
     ```text
     mongodb+srv://<db_username>:<db_password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<db_username>` with your database username and `<db_password>` with your database password (remove the `<` and `>` brackets).
   - Tip: Insert a database name after the slash `/` and before the `?` to separate your data. For example, insert `artify` like this: `...mongodb.net/artify?retryWrites...`

---

## Part 2: Local Verification (Optional but Recommended)

Before deploying to the web, you can verify your MongoDB connection locally.

1. Open [backend/.env](file:///c:/Users/Channaraja%20Swamy/OneDrive/Desktop/artify/backend/.env) and update the `MONGO_URI` with your connection string:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://artify-user:your_password@cluster0.xxxx.mongodb.net/artify?retryWrites=true&w=majority
   JWT_SECRET=supersecretartifykey12345
   ```
2. Navigate to your backend directory in your terminal and run:
   ```bash
   npm run dev
   ```
3. Your console should print:
   ```text
   Connecting to database at mongodb+srv://...
   🟢 MongoDB Connected: cluster0-shard-00-00.xxxx.mongodb.net
   ```

---

## Part 3: Deploy the Backend on Render

Render is a great platform for hosting Node.js Express APIs.

1. **Log In to Render**:
   - Go to [render.com](https://render.com/) and sign up or sign in using your GitHub account.
2. **Create a New Web Service**:
   - Click **New** (top right) -> **Web Service**.
   - Connect your GitHub repository: `CHANNARAJASWAMYMNM/artifyy`.
3. **Configure Settings**:
   - **Name**: `artify-backend`
   - **Region**: Choose a region close to you (e.g., `Singapore` or `Oregon`).
   - **Branch**: `main`
   - **Root Directory**: `backend` *(This is important because your API code sits in the `backend` subfolder)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js` (or `npm start`)
   - **Instance Type**: Select **Free**
4. **Set Environment Variables**:
   - Click **Advanced** and add the following variables:
     * `MONGO_URI`: *Your MongoDB Atlas connection string*
     * `JWT_SECRET`: *A secure random string (e.g. `super-secret-key-for-artify-prod-2026`)*
5. **Deploy**:
   - Click **Create Web Service**.
   - Render will build and deploy your backend. Once it is done, copy the URL of your live service (e.g., `https://artify-backend.onrender.com`).

---

## Part 4: Deploy the Frontend (Next.js)

Since Next.js is optimized for **Vercel**, deploying it there is highly recommended. However, you can also deploy it on **Render**.

### Option A: Deploying on Vercel (Recommended - Faster & Easier)
1. Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your `artifyy` repository.
4. Configure the settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Leave empty (`./` - the root directory, which contains `app/`, `package.json` for Next.js).
5. Add Environment Variables:
   - Expand the **Environment Variables** section.
   - Add:
     * **Key**: `NEXT_PUBLIC_BACKEND_URL`
     * **Value**: `https://your-render-backend-url.onrender.com/api` (The URL you copied from Render, ending with `/api`).
6. Click **Deploy**. Vercel will build and launch your frontend.

---

### Option B: Deploying on Render (Alternative)
1. Go to [render.com](https://render.com/) and click **New** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `artify-frontend`
   - **Root Directory**: Leave blank (it will build from the root folder)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - Click **Advanced** and add:
     * `NEXT_PUBLIC_BACKEND_URL` = `https://your-render-backend-url.onrender.com/api`
5. Click **Create Web Service**.

---

## How it All Works Together

Once both deployments are successful:
- Your Next.js frontend will make API requests to `NEXT_PUBLIC_BACKEND_URL` (the backend deployed on Render).
- Your Express backend on Render will process those requests and read/write data directly to MongoDB Atlas.
- In the event that the backend API is slow or offline, your frontend has a built-in fallback to use the local browser storage so the site remains functional.
