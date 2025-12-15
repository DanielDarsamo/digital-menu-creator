# 📘 Fortaleza Digital Menu - Application Documentation

## 1. System Overview
**Fortaleza Digital Menu** is a modern, real-time web application designed for restaurants to manage digital orders. It consists of two main interfaces:
1.  **Client-Facing Menu**: A responsive web app for customers to browse, order, and track status.
2.  **Admin Dashboard**: A secure panel for staff to manage orders in real-time.

**Tech Stack:**
*   **Frontend**: React (Vite), TypeScript, Tailwind CSS
*   **Backend/Database**: Supabase (PostgreSQL)
*   **Real-time**: Supabase Realtime Channels
*   **UI Components**: Shadcn/UI, Lucide Icons

---

## 2. Architecture & Database

### Database Schema (Supabase)
The system relies on a central `orders` table extended with tracking capabilities.

**Table: `orders`**
*   `id` (UUID): Unique identifier.
*   `order_number` (INT): Sequential number for display (e.g., #105).
*   `items` (JSONB): Array of ordered items (id, name, quantity, price).
*   `status` (TEXT): Lifecycle state (pending, confirmed, preparing, ready, delivered, cancelled).
*   `total_price` (DECIMAL): Total value.
*   `customer_info`: Name, Email, Phone, Table.
*   `timestamps`: created_at, updated_at.

**Table: `order_status_history`**
*   Audit log tracking every status change, timestamp, and actor.

### Real-Time Synchronization
*   The app uses **Supabase Subscriptions**.
*   **Admin Side**: Listens for `INSERT` (new orders), `UPDATE` (status changes), `DELETE`.
*   **Client Side**: Listens for updates to their specific orders based on ID.

---

## 3. Key Components

### A. Order Service (`orderService.ts`)
The core logic layer handling all database interactions.
*   `createOrder()`: Generates ID, calculates totals, saves to DB.
*   `updateOrderStatus()`: Change state (one-way transitions enforced).
*   `subscribeToOrders()`: Sets up WebSocket connection for live updates.
*   `getCustomerOrders()`: Fetches history based on User Email/Phone.

### B. Client Menu
*   **`OrderCart.tsx`**: The main hub for the user. Contains:
    *   **Tab System**: Switches between Cart and History.
    *   **Logic**: Handles local cart state (React Context).
*   **`OrderStatus.tsx`**: Live tracking component. Reads active orders and displays badges.
*   **`CustomerInfoDialog.tsx`**: Collects user data and handles WhatsApp + DB submission.

### C. Admin Dashboard
*   **`AdminDashboard.tsx`**: Protected route.
*   **Auth**: Session-based simplistic auth (Password: `fortaleza2024`).
*   **Kanban/List View**: Orders filtered by status tabs.

---

## 4. Features Specification

### 1. Dual Ordering System
*   **Database Order**: Primary method. Saved to backend.
*   **WhatsApp Backup**: Optional parallel message sent to restaurant WhatsApp with order details.

### 2. Order Immutability
*   Once an order moves past `Pending`, it is locked.
*   Prevents accidental edits during preparation.

### 3. Smart History & Re-ordering
*   **Persistence**: User details (Email/Phone) stored in `localStorage`.
*   **History**: Retrieves all past delivered/cancelled orders associated with user.
*   **Re-order**: "Repetir Pedido" logic looks up original item IDs in current `menuData` to ensure price/availability validity before adding to cart.

---

## 5. Deployment & Configuration

### Environment Variables
*   `VITE_SUPABASE_URL`: Project URL.
*   `VITE_SUPABASE_ANON_KEY`: Public API Key.

### Routing (Netlify)
*   Configured via `netlify.toml` to handle React Router (Client-side routing).
*   Redirects `/*` to `/index.html`.

### Security
*   **RLS (Row Level Security)**:
    *   Currently configured for development (Public Read/Write).
    *   *Recommendation*: Lock down for production using Supabase Auth policies.
*   **Admin Access**:
    *   Frontend password gate.
    *   Redirects `/admin` to `/admin-login` if no session exists.

---

## 6. Directory Structure
```
src/
├── components/
│   ├── menu/          # Client facing components (Cart, ProductCard)
│   ├── ui/            # Reusable UI elements (Buttons, Tabs)
├── contexts/          # State management (OrderContext)
├── data/              # Static menu data (menuData.ts)
├── lib/               # Utilities (Supabase client, utils)
├── pages/             # Route pages (Index, Admin, Login)
└── services/          # Business logic (OrderService)
```
