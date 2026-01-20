# 📘 Fortaleza Digital Menu - Application Documentation

## 1. System Overview
**Fortaleza Digital Menu** is a modern, real-time web application designed for restaurants to manage digital orders. It transforms operations into a role-based platform with distinct interfaces for:
1.  **Customers**: Public menu to browse, order, and track status.
2.  **Admins**: Full control dashboard for orders, menu, and staff.
3.  **Waiters**: Focused interface for order fulfillment and delivery.

**Tech Stack:**
*   **Frontend**: React (Vite), TypeScript, Tailwind CSS
*   **Backend/Database**: Supabase (PostgreSQL + Auth)
*   **Real-time**: Supabase Realtime Channels
*   **UI Components**: Shadcn/UI, Lucide Icons

---

## 2. Architecture & Database

### Database Schema (Supabase)
The system relies on a relational model linking Users, Profiles, and Orders.

**Table: `profiles`**
*   `id` (UUID): References `auth.users`.
*   `role` (TEXT): 'admin' or 'waiter'.
*   `full_name`: Display name.

**Table: `orders`**
*   `id` (UUID): Unique identifier.
*   `order_number` (INT): Sequential number.
*   `status` (TEXT): pending -> confirmed -> preparing -> ready -> delivered.
*   `waiter_id` (UUID): Reference to `profiles` (assigned waiter).
*   `items` (JSONB): Array of ordered items.
*   `total_price`, `customer_info`, `timestamps`.

### Authentication & RBAC
*   **Supabase Auth**: Handles secure login.
*   **RBAC (Role-Based Access Control)**:
    *   **RLS Policies**: Enforce data security at the database level.
    *   **Frontend Protection**: `ProtectedRoute` component redirects based on Role.

---

## 3. Key Components

### A. Authentication (`AuthContext.tsx`)
*   Manages user session.
*   Automatically fetches User Role (`admin` vs `waiter`) on login.
*   Provides `isAdmin`, `isWaiter` helpers.

### B. Admin Platform (`/admin`)
*   **Layout**: Tabbed interface (Orders, Menu, Staff, Analytics).
*   **Orders View**: Real-time Kanban/List view of all restaurant orders.
*   **Capabilities**: Full CRUD on orders, menu management (planned), system configs.

### C. Waiter Platform (`/waiter`)
*   **Queue View**: Available "Confirmed" orders ready for pickup.
*   **My Orders**: Orders assigned to the logged-in waiter.
*   **Workflow**: Accept -> Prepare -> Ready -> Deliver.

### D. Client Menu (`/`)
*   **Public Access**: No login required.
*   **Features**: Cart, Checkout, Order Tracking (via localStorage or Session).

---

## 4. Features Specification

### 1. Dual Ordering System
*   **Database Order**: Primary method. Saved to backend.
*   **WhatsApp Backup**: Optional parallel message.

### 2. Order Lifecycle with Accountability
*   **Pending**: Customer placed order.
*   **Confirmed**: Admin acknowledged.
*   **Preparing**: Waiter/Kitchen started work (Waiter Assigned).
*   **Ready**: Food is ready for pickup/delivery.
*   **Delivered**: Handed to customer (Final State).
*   *Timestamps tracked for every stage*.

---

## 5. Deployment & Configuration

### Environment Variables
*   `VITE_SUPABASE_URL`: Project URL.
*   `VITE_SUPABASE_ANON_KEY`: Public API Key.

### Routing
*   **React Router**: Client-side routing.
*   **Protected Routes**: Wrappers check `AuthContext` before rendering Admin/Waiter pages.

---

## 6. Directory Structure
```
src/
├── components/
│   ├── admin/         # Admin specific (AdminOrdersView)
│   ├── auth/          # ProtectedRoute
│   ├── menu/          # Client facing components
│   ├── ui/            # Shadcn UI
├── contexts/          # AuthContext, OrderContext
├── pages/             # Login, AdminDashboard, WaiterDashboard
├── services/          # OrderService
└── lib/               # Supabase client
```
