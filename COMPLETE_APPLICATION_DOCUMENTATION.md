# 📘 Fortaleza Digital Menu - Complete Application Documentation

## 1. Information about the Application

**Fortaleza Digital Menu** is a comprehensive, real-time order management system designed to modernize restaurant operations. It replaces traditional paper-based notifications with a digital, role-based ecosystem that connects customers, waiters, kitchen staff, and administrators in real-time.

### Core Purpose
To streamline the dining experience by:
- Allowing customers to self-order from a digital menu.
- Providing the kitchen with instant order details.
- Empowering waiters with effective order tracking tools.
- giving administrators full oversight and control.

### Technology Stack
- **Frontend**: React (Vite) with TypeScript.
- **Styling**: Tailwind CSS for responsive, modern design.
- **UI Components**: Shadcn/UI for consistent, accessible components.
- **Backend/Database**: Supabase (PostgreSQL) for reliable data storage.
- **Real-time**: Supabase Realtime Channels for instant updates across devices.
- **Icons**: Lucide React.
- **Deployment**: Netlify/Vercel compatible.

---

## 2. How the Application Works

The application operates on a **Role-Based Access Control (RBAC)** model. Each user type interacts with a specific interface tailored to their responsibilities.

### User Roles & Workflows

#### A. Customer (Public Access)
- **Interface**: The main landing page (`/`).
- **Functionality**:
    - Browses the visual menu with categories (Burgers, Drinks, etc.).
    - Adds items to a local shopping cart.
    - **Dual Checkout**:
        1.  **System Order**: Submits directly to the restaurant's database (Primary).
        2.  **WhatsApp**: Sends a pre-formatted message to the restaurant's WhatsApp (Backup/Notification).
    - **Order History**: Tracks their own orders via local storage, allowing them to see status updates ("Pending" -> "Preparing" -> "Ready").

#### B. Administrator (Manager)
- **Interface**: Admin Dashboard (`/admin`).
- **Functionality**:
    - **Live Order Feed**: Sees all incoming orders instantly.
    - **Order Management**: Confirms "Pending" orders to validate them for the kitchen.
    - **Analytics**: (Planned) View sales metrics.
    - **Staff/Menu Management**: (Planned) Configure menu items and staff accounts.

#### C. Waiter
- **Interface**: Waiter Dashboard (`/waiter`).
- **Functionality**:
    - **Queue Management**: Sees "Confirmed" orders ready to be accepted.
    - **Responsibility**: "Accepts" an order to take ownership.
    - **Delivery**: Marks orders as "Delivered" once they hand them to the customer.

#### D. Kitchen Staff
- **Interface**: Kitchen Dashboard (`/kitchen`).
- **Functionality**:
    - **Prep View**: Sees orders marked as "Confirmed" or "Preparing".
    - **Workflow**:
        - Prints order receipts (Single or Bulk).
        - Marks orders as "Ready" when food is cooked.
    - **Focus**: Simplified view to avoid distractions, showing only active food orders.

### The Order Lifecycle
The "Heartbeat" of the application is the status transition flow:

1.  **Pending**: Customer submits order.
2.  **Confirmed**: Admin verifies the order (Money received/Valid).
3.  **Preparing**: Waiter/Kitchen accepts the order and starts working.
4.  **Ready**: Kitchen finishes cooking; food is at the pass.
5.  **Delivered**: Waiter brings food to table; transaction complete.

---

## 3. Prompts Used (Development History)

This application was evolved through specific AI prompts. Below is a summary of the key prompts that defined its features:

### Phase 1: Foundation & Design
*   "Create a digital menu application using React and Tailwind."
*   "Enhance the design aesthetics. Use vibrant colors, glassmorphism, and high-quality animations."
*   *Result*: Created the visually rich Hero section and Menu Cards.

### Phase 2: Core Functionality
*   "Implement a shopping cart system."
*   "When finalizing order, send a formatted message to WhatsApp number `258871838947`."
*   "Add location button that floats and links to Google Maps."
*   *Result*: Functional cart and WhatsApp integration.

### Phase 3: Admin & Backend
*   "Create a backend system. I want orders to go to an Admin Panel AND WhatsApp."
*   "Secure the admin panel. It should not be accessible to customers."
*   *Result*: `/admin` route and basic security.

### Phase 4: Supabase & Real-time
*   "Integrate Supabase. Replace localStorage order system with a real database."
*   "I want real-time updates. The admin should see orders appear instantly."
*   *Result*: Persistent database and live syncing.

### Phase 5: Advanced Features
*   "Implement Order Status, Estado & Order History System Specification."
*   "Fix 404 error on Netlify for /admin routes."
*   *Result*: Robust status tracking, Re-order functionality, and deployment fixes.

---

## 4. Areas for Improvement (Technical Audit)

While the application is functional, the following areas identified need attention for scaling:

### A. Performance Optimization
*   **Server-Side Filtering**: Currently, the `KitchenDashboard` (and others) fetches **ALL** orders and filters them in the browser. As order history grows to thousands, this will slow down the app.
    *   *Fix*: Update `OrderService` to accept status parameters (e.g., `getOrders({ status: 'preparing' })`) and filter at the database level.
*   **Pagination**: No pagination is implemented. The Admin dashboard will try to render every order ever made.

### B. Security & Auth
*   **Auth Granularity**: We primarily rely on a simple check. We should ensure comprehensive Row Level Security (RLS) policies are fully tested to prevent, for example, a savvy customer from fetching admin data via the API Console.
*   **Component-Level Security**: Ensure all "Protected" components verify the role *every* time they load data, not just on route entry.

### C. Missing Features (Technical Debt)
*   **Staff Management**: The "Staff" tab in Admin is currently a placeholder.
*   **Analytics**: The "Analytics" tab needs to be connected to real data aggregations (e.g., "Most popular dish", "Peak hours").
*   **Menu Management**: Currently, menu items are likely hardcoded or static. Admin needs a UI to Add/Edit/Remove dishes dynamically (Image upload, price changes).

---

## 5. Next Steps

To bring this application to a fully production-ready "V1.0", execute the following roadmap:

### Step 1: Menu Management System (High Priority)
*   Build the Admin "Menu" tab.
*   Create a Supabase table for `menu_items`.
*   Implement "Add Dish" form with image hosting (Supabase Storage).
*   Refactor the frontend to fetch the menu from DB instead of the hardcoded file.

### Step 2: Optimization Refactor
*   Implement `getOrdersByStatus(status: string[])` in `OrderService`.
*   Update Kitchen and Waiter dashboards to use this filtered query.
*   Add basic pagination (Load last 50 orders only).

### Step 3: Analytics Dashboard
*   Create PostgreSQL Views for daily/monthly stats.
*   Visualize "Revenue Today" and "Order Count" on the Admin Analytics tab.

### Step 4: Final Polish & Deploy
*   Run a full accessibility audit (ARIA labels).
*   Set up a production environment in Supabase (separate from Dev).
*   Deploy to a custom domain.

---
*Documentation generated by Gemini Agent on Jan 24, 2026.*
