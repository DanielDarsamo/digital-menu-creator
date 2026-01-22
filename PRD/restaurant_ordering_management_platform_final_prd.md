# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Restaurant Ordering & Management Platform
**Version:** 1.0 (Final)
**Prepared by:** Daniel

---

## 1. PRODUCT OVERVIEW

### 1.1 Purpose
This platform is a **digital restaurant ordering and management system** designed to replace manual menus, handwritten orders, and fragmented billing processes.

It enables:
- Customers to view the menu, place orders, and track progress from their table
- Individual customer identification per table for split billing
- Waiters to manage and deliver orders efficiently
- Kitchen staff to prepare orders with real-time visibility
- Admin/Owner to manage menu, staff, and business analytics

The system is designed to be **fast, reliable, mobile-first, and scalable**.

---

## 2. USER ROLES & ACCESS LEVELS

### 2.1 Customer (Guest)
No account required. Identified via **Name + Phone Number**.

Capabilities:
- View digital menu
- Place orders
- Track order status in real time
- Be uniquely identified at a table
- Pay individually or as part of a group

---

### 2.2 Waiter
Authenticated staff role.

Capabilities:
- View tables and customers
- Accept or reject orders
- Send orders to kitchen
- Mark orders as delivered
- Confirm payments
- Track their own performance

---

### 2.3 Kitchen Staff
Authenticated operational role.

Capabilities:
- View accepted orders
- See item breakdown and notes
- Update preparation status (In preparation / Ready)

No access to payments or financials.

---

### 2.4 Admin / Owner
Full system access.

Capabilities:
- Manage menu and categories
- Manage staff and roles
- View financials and analytics
- Export reports
- Configure system behavior

---

## 3. CUSTOMER IDENTIFICATION & TABLE LOGIC

### 3.1 Customer Session Model
Each customer at a table is identified by:
- Full name
- Phone number

This creates a **Customer Session** that persists for the duration of the table’s activity.

Rules:
- One active session per phone number per table
- Same phone number can be reused on different days or tables
- No passwords or accounts required

---

### 3.2 Customer Entry Flow

1. Customer scans QR code or opens menu
2. Selects items
3. On first order submission, prompted to enter:
   - Name (required)
   - Phone number (required)
4. System creates a Customer Session
5. All future orders are linked automatically

---

## 4. CUSTOMER FEATURES

### 4.1 Menu Viewing
- Categorized menu (e.g. Starters, Main Dishes, Drinks)
- Item details:
  - Name
  - Description
  - Price
  - Image
  - Availability

Menu updates reflect in real time.

---

### 4.2 Ordering
- Add items to cart
- Adjust quantities
- Add special notes
- Submit order linked to:
  - Table
  - Customer session

---

### 4.3 Order Tracking
Customers can track their order through the following statuses:

1. Pending confirmation
2. Accepted by waiter
3. In kitchen
4. Ready
5. On the way
6. Delivered
7. Paid

---

### 4.4 Payment Visibility
Customers can:
- See their own unpaid total
- See paid/unpaid status
- Pay independently from others at the same table

---

## 5. WAITER SYSTEM

### 5.1 Table View (Critical)

Each table displays customers clearly identified:

```
Table 5
 ├── Ana – 8456737821 (PAID)
 ├── João – 8765432109 (UNPAID – 450 MT)
 └── Carlos – 8234567890 (UNPAID – 200 MT)
```

---

### 5.2 Order Management
- View incoming orders in real time
- Accept or reject orders
- Assign themselves automatically on acceptance
- Reject with mandatory reason

---

### 5.3 Order Lifecycle Control
Waiters can:
- Send order to kitchen
- Mark order as delivered
- Confirm payment

All actions are timestamped and logged.

---

## 6. KITCHEN SYSTEM

### 6.1 Kitchen Dashboard
- List of accepted orders
- Item-level breakdown
- Customer notes visible

---

### 6.2 Status Updates
Kitchen can mark:
- In preparation
- Ready

Status updates propagate instantly to:
- Waiters
- Customers

---

## 7. ADMIN DASHBOARD

### 7.1 Menu Management
Admin can:
- Add/edit/remove menu items
- Change prices
- Upload/change images
- Enable/disable items
- Manage categories

---

### 7.2 Staff Management
Admin can:
- Add waiters and kitchen staff
- Assign roles
- View performance metrics

---

### 7.3 Sales & Analytics

Available metrics:
- Daily / weekly / monthly revenue
- Number of orders
- Average order value

Menu performance:
- Best-selling items
- Least-selling items
- Revenue per item

Waiter performance:
- Orders handled
- Revenue handled
- Average handling time

---

### 7.4 Financial Tracking
- Paid vs unpaid orders
- Partial payments per table
- Export reports (CSV / PDF)

---

## 8. DATA MODEL (HIGH LEVEL)

### CustomerSession
- id
- name
- phone_number
- table_id
- payment_status (unpaid | partial | paid)
- created_at

---

### Order
- id
- table_id
- customer_session_id
- waiter_id
- status
- total_amount
- created_at

---

### Payment
- id
- customer_session_id
- order_id (nullable)
- amount
- payment_method
- confirmed_by_waiter
- paid_at

---

## 9. NON-FUNCTIONAL REQUIREMENTS

### Performance
- Real-time updates (<1s latency)
- Support at least 100 concurrent users

### Security
- Role-based access control
- Admin-only access to financial data

### Usability
- Mobile-first UI
- Large buttons for waiters and kitchen
- Minimal steps for customers

---

## 10. DELIVERY PHASES

### Phase 1 – MVP
- Customer ordering
- Customer identification
- Waiter confirmation
- Kitchen dashboard
- Admin menu management

### Phase 2 – Business Intelligence
- Analytics dashboards
- Waiter performance
- Revenue insights

### Phase 3 – Expansion
- Payment integrations
- Multi-branch support
- Loyalty system

---

## 11. SUCCESS METRICS

- Reduced order errors
- Faster service time
- Clear split billing
- Improved waiter accountability
- Increased average order value

---

## 12. FUTURE EXTENSIONS

- WhatsApp receipts
- Loyalty points per phone number
- Online takeaway & delivery
- SaaS version for multiple restaurants

---

**END OF DOCUMENT**

