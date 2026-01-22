# Complete Order Flow Testing Guide

## 🎯 Objective
Test the complete end-to-end order lifecycle from customer order to delivery, including all role-based dashboards.

## ✅ Prerequisites

Before starting, ensure you have:
1. **Admin user created in Supabase** (admin@fortaleza.com)
2. **Dev server running** (`npm run dev`)
3. **Multiple browser windows/tabs** ready for testing different roles

---

## 📋 Testing Checklist

### Phase 1: Create Test Order (Customer Role)

**URL:** `http://localhost:8080/`

**Steps:**
1. Browse the menu
2. Add 2-3 items to cart
3. Click cart icon
4. Click "Finalizar" button
5. Fill in customer information:
   - Name: "Test Customer 2"
   - Table: "Mesa 10"
   - Notes: "Extra napkins please"
6. Select "Sistema" option
7. Click "Confirmar"
8. **Expected:** Toast notification shows order number
9. **Expected:** Cart clears automatically

**Screenshot:** Capture the success toast

---

### Phase 2: Confirm Order (Admin Role)

**URL:** `http://localhost:8080/login`

**Steps:**
1. Login with admin credentials:
   - Email: `admin@fortaleza.com`
   - Password: `admin123`
2. **Expected:** Redirect to `/admin`
3. View "Orders" tab (should be default)
4. **Expected:** See pending order from Phase 1
5. Find the order with status "pending"
6. Change status to "confirmed" using dropdown
7. **Expected:** Toast notification confirms update
8. **Expected:** Order moves to "Confirmed" section

**Screenshots:**
- Admin dashboard with pending order
- Order status dropdown
- Confirmed order

---

### Phase 3: Accept Order (Waiter Role)

**URL:** `http://localhost:8080/login` (logout first or use incognito)

**Steps:**
1. Login with waiter credentials:
   - Email: `waiter@fortaleza.com`
   - Password: `waiter123`
2. **Expected:** Redirect to `/waiter`
3. Click "Fila de Pedidos" (Queue) tab
4. **Expected:** See confirmed order from Phase 2
5. Click "Aceitar" button on the order
6. **Expected:** Order moves to "Meus Pedidos" (My Orders) tab
7. **Expected:** Order status changes to "preparing"
8. Click "Meus Pedidos" tab to verify

**Screenshots:**
- Queue with available order
- My Orders with accepted order

---

### Phase 4: Prepare Order (Kitchen Role)

**URL:** `http://localhost:8080/kitchen`

**Steps:**
1. Access kitchen dashboard (should already be logged in as waiter)
2. **Expected:** See order with status "preparing"
3. **Test Print:** Click "Print" button on the order
4. **Expected:** Print dialog opens with formatted receipt
5. **Test Print All:** Click "Print All" button (if multiple orders)
6. Click "Start Preparing" button (if status is "confirmed")
7. **Expected:** Order status updates to "preparing"
8. Click "Mark Ready" button
9. **Expected:** Order status updates to "ready"
10. **Expected:** Order disappears from kitchen dashboard

**Screenshots:**
- Kitchen dashboard with preparing order
- Print preview
- Order marked as ready

---

### Phase 5: Deliver Order (Waiter Role)

**URL:** `http://localhost:8080/waiter`

**Steps:**
1. Return to waiter dashboard
2. Click "Meus Pedidos" tab
3. **Expected:** See order with status "ready"
4. Click "Entregar" (Deliver) button
5. **Expected:** Order status changes to "delivered"
6. **Expected:** Order moves to completed section

**Screenshots:**
- Ready order in My Orders
- Delivered confirmation

---

### Phase 6: Verify Customer History

**URL:** `http://localhost:8080/`

**Steps:**
1. Click cart icon
2. Click "Histórico" (History) tab
3. **Expected:** See delivered order in history
4. **Expected:** Order shows "Entregue" (Delivered) badge
5. Click "Repetir" (Reorder) button
6. **Expected:** Items added to cart
7. **Expected:** Toast notification confirms

**Screenshots:**
- Order history view
- Reorder functionality

---

## 🧪 Additional Feature Tests

### Test 1: Order Filtering (Admin)

**Steps:**
1. Login as admin
2. Click different status tabs:
   - All Orders
   - Pending
   - Confirmed
   - Preparing
   - Ready
   - Delivered
3. **Expected:** Each tab shows only orders with that status

### Test 2: Order Deletion (Admin)

**Steps:**
1. Find a completed/cancelled order
2. Click delete button
3. **Expected:** Confirmation dialog appears
4. Confirm deletion
5. **Expected:** Order removed from list

### Test 3: Logout Functionality

**Steps:**
1. Click logout button (admin/waiter/kitchen)
2. **Expected:** Redirect to login page
3. **Expected:** Session cleared
4. Try accessing protected route directly
5. **Expected:** Redirect to login

### Test 4: Real-Time Updates

**Steps:**
1. Open admin dashboard in one window
2. Open waiter dashboard in another window
3. Create new order as customer
4. **Expected:** Order appears in admin dashboard automatically
5. Confirm order as admin
6. **Expected:** Order appears in waiter queue automatically

### Test 5: Analytics Tab (Admin)

**Steps:**
1. Login as admin
2. Click "Analytics" tab
3. **Expected:** See order statistics (if implemented)

### Test 6: Staff Management Tab (Admin)

**Steps:**
1. Login as admin
2. Click "Staff" tab
3. **Expected:** See staff list or "Coming Soon" message

---

## 📊 Order Status Flow

```
Customer Order → pending
       ↓
Admin Confirms → confirmed
       ↓
Waiter Accepts → preparing
       ↓
Kitchen Prepares → preparing
       ↓
Kitchen Marks Ready → ready
       ↓
Waiter Delivers → delivered
```

---

## 🐛 Common Issues & Solutions

### Issue: Orders not appearing in waiter queue
**Solution:** Ensure admin has confirmed the order (status = "confirmed")

### Issue: Can't login as admin
**Solution:** Verify admin user exists in Supabase and role is set to "admin"

### Issue: Print not working
**Solution:** Allow popups in browser settings

### Issue: Real-time updates not working
**Solution:** Check Supabase Realtime is enabled in project settings

---

## ✅ Success Criteria

- [ ] Customer can place orders successfully
- [ ] Admin can view and confirm pending orders
- [ ] Waiter can see and accept confirmed orders
- [ ] Kitchen can view and update preparing orders
- [ ] Print functionality works for individual and bulk orders
- [ ] Waiter can deliver ready orders
- [ ] Customer can view order history
- [ ] Customer can reorder from history
- [ ] All status transitions work correctly
- [ ] Real-time updates work across dashboards
- [ ] Logout works for all roles
- [ ] Toast notifications appear at appropriate times

---

## 📸 Documentation

After completing all tests:
1. Collect all screenshots
2. Note any bugs or issues
3. Document the complete flow
4. Update walkthrough.md with results
