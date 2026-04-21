# Instagram Clone - Distributed Architecture

A professional, horizontally scalable Instagram clone built with Next.js, Node.js (Socket.io), and Redis. This project is specifically designed to handle real-time communication across multiple server instances.

## 🚀 Key Project Flow & Architecture

### 1. Distributed Real-time System
- **Engine**: Socket.io backed by an `@socket.io/redis-adapter`.
- **Flow**: When a user connects, they join a private room named after their `userId`. This ensures that messages sent to `io.to(userId)` reach the user regardless of which server instance they are connected to.
- **Features**: Real-time Chat, Follow Notifications, and Online/Offline status syncing via Redis.

### 2. Robust Cross-Domain Authentication
- **Secure Handshake**: Uses JWT with an `accessToken` (1h) and `refreshToken` (7d).
- **Deployment Fix**: To handle strict browser cookie policies (like on Vercel/Render), the system uses a **Hybrid Auth** approach:
    1. Server sets `httpOnly` secure cookies.
    2. Frontend explicitly injects the token into the Socket `auth` object from `localStorage` as a backup.
    3. The Socket Middleware on the server verifies both sources to ensure 100% connectivity.

### 3. Seller Verification Flow
- **Payment**: Integrated with **Razorpay** for verification fee processing.
- **Status Lifecycle**: `none` -> `pending` (waiting for admin) -> `approved` (role upgraded to `seller`) or `rejected`.
- **System**: Uses a unified `verificationStatus` enum for consistency across API routes and UI.

### 4. Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Redux Toolkit, React Query.
- **Backend (Real-time)**: Node.js, Express, Socket.io, Redis (Upstash).
- **Database**: MongoDB (Mongoose) with optimized aggregation for chat unread counts.
- **Media**: Cloudinary for high-performance image hosting.

## 🛠 Deployment Configuration

### Required Environment Variables (Server)
- `MONGODB_URI`: Database connection.
- `REDIS_URL`: Redis connection for distributed syncing.
- `ACCESS_SECRET`: JWT signing secret (must match Frontend).
- `FRONTEND_URL`: Restricted CORS origin for production security.

### Required Environment Variables (Frontend)
- `NEXT_PUBLIC_SOCKET_URL`: The URL of your deployed Render backend.
- `ACCESS_SECRET`: JWT signing secret (must match Backend).
