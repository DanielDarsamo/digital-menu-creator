# 📘 Fortaleza Digital Menu - Application Documentation

## 1. System Overview
**Fortaleza Digital Menu** is a comprehensive restaurant management system that bridges the gap between customers, waiters, kitchen staff, and administrators. It operates in real-time, ensuring that orders flow seamlessly from creation to delivery.

**Core User Roles:**
1.  **Customers**: Scan QR codes to open a session, browse the menu, and place orders directly to the kitchen/waiter queue.
2.  **Waiters**: Manage assigned tables, accept orders, process payments, and deliver food.
3.  **Kitchen**: View a live KDS (Kitchen Display System) to manage preparation flows.
4.  **Admins**: Oversee the entire operation, manage staff, menus, and view financial analytics.

**Tech Stack:**
*   **Frontend**: React (Vite) + TypeScript + Tailwind CSS
*   **Backend**: Supabase (PostgreSQL + Auth + Realtime)
*   **UI Library**: Shadcn/UI + Lucide Icons
*   **State Management**: React Context + TanStack Query

---

## 2. Architecture & Database

### Database Schema (Key Tables)
The system uses a relational model optimized for real-time syncing.

*   `customer_sessions`: **Active** sessions linked to physical tables. Tracks customer info (Name/Phone) and payment status.
*   `orders`: Central ledger. Status flow: `pending` -> `confirmed` (Kitchen) -> `preparing` -> `ready` -> `delivered`.
*   `profiles`: Staff accounts (Admins/Waiters) linked to Supabase Auth.
*   `payments`: Logs of all transactions (Cash/Card/M-Pesa).

### Authentication & Security (**Dev Mode Alert**)
*   **Production**: Strict Role-Based Access Control (RLS) policies ensure Waiters only see their orders and Admins see everything.
*   **Development**: Currently, **routes in `App.tsx` are UNPROTECTED** to facilitate rapid debugging.
    *   *Warning*: The `switch (role)` logic in `ProtectedRoute` is currently bypassed.
    *   *Action Item*: Re-enable protection before staging deployment.

---

## 3. Key Components & Features

### A. Waiter Portal (`/waiter`)
Designed for mobile use by staff on the floor.
*   **Tables View**: Live status of all tables. Shows "Unpaid Total" per customer. Allows **Split Bill** payment collection (Cash/Card/M-Pesa).
*   **Queue**: Incoming "Confirmed" orders waiting for a waiter to "Accept" valid responsibility.
*   **My Orders**: Kanban-style cards for orders currently being handled by the logged-in waiter.
*   **My Stats**: Personal daily performance metrics (Total Orders, Revenue).

### B. Kitchen Dashboard (`/kitchen`)
A focused KDS for the back-of-house.
*   **Real-time Feed**: Orders appear instantly as they are confirmed.
*   **Workflow**: One-tap "Start Preparing" and "Mark Ready".
*   **Printing**: Supports thermal printing for individual or batched tickets.

### C. Admin Suite (`/admin`)
*   **Staff Management**: invite new staff, promote/demote roles (Admin/Waiter), and revoke access.
*   **Menu Manager**: CRUD operations for dishes, categories, and availability.
*   **Analytics**: High-level sales data.

### D. Customer Experience
*   **Session-based**: Customers enter their name/table number to start a session.
*   **Cart & Order**: Add items, add special notes, and submit.
*   **Digital Bill**: View running total in real-time.

---

## 4. Operational Workflow

1.  **Session Start**: Customer scans QR, enters name & table #.
2.  **Ordering**: Customer places order -> Status `Pending`.
3.  **Confirmation**: Admin/System confirms order -> Status `Confirmed`.
4.  **Assignment**: Waiter sees order in **Queue**, clicks "Accept" -> Status `Confirmed` (Assigned).
5.  **Kitchen**: Sees assigned order, clicks "Start Preparing" -> "Ready".
6.  **Delivery**: Waiter gets "Ready" notification, delivers food, marks `Delivered`.
7.  **Payment**: Waiter goes to **Tables Tab**, selects Customer, takes payment -> Order Closed.

---

## 5. Roadmap & Next Steps

### 🔴 Immediate Actions (Critical)
1.  **Re-secure Routes**: Re-enable `ProtectedRoute` in `App.tsx` and create a proper "Dev Mode Toggle" in the UI if needed, rather than commenting out code.
2.  **RLS Audit**: Ensure `granular_rls.sql` is fully applied so "Waiters" literally *cannot* delete orders or see admin analytics at the API level.

### 🟡 Missing Features (To Build)
1.  **Notifications Soundscape**:
    *   Kitchen needs a loud "New Ticket" chime.
    *   Waiters need a "Food Ready" ping.
    *   *Current*: Only visual toasts (`sonner`).
2.  **Payment Integration**:
    *   *Current*: "Simulated" recording of Cash/M-Pesa.
    *   *Next Step*: Integrate M-Pesa API for automated push-to-pay triggers.
3.  **Offline Mode**:
    *   Service Workers to handle spotty restaurant Wi-Fi.

### 🟢 Improvements & Suggestions
1.  **Mobile Optimization**:
    *   Test `TableView` on actual small screens (320px width). The "Receive Payment" dropdown might be cramped.
2.  **Pagination**:
    *   `OrderService.getAllOrders` checks *everything*. As history grows, this will lag.
    *   *Fix*: Implement cursor-based pagination for the "History" views.
3.  **Kitchen Analytics**:
    *   Track "Prep Time" (Time from `preparing` -> `ready`) to identify bottlenecks.

---

## 6. Directory Map (Updated)
```
src/
├── components/
│   ├── admin/         # StaffManagement, MenuBuilder
│   ├── waiter/        # TableView, OrderCard
│   ├── kitchen/       # KitchenOrderCard
│   └── shared/        # Reusable UI (OrderCard)
├── pages/
│   ├── WaiterDashboard.tsx   # The main Tabbed controller
│   ├── KitchenDashboard.tsx  # KDS View
│   └── Login.tsx
├── services/
│   ├── orderService.ts       # Core logic + Subscriptions
│   ├── staffService.ts       # User management
│   └── paymentService.ts     # Transaction logging
└── lib/
    ├── supabase.ts           # Customer client
    ├── supabase-admin.ts     # High-privilege client
    └── supabase-waiter.ts    # Staff client
```
