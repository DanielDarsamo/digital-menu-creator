# 🚀 Development Access Guide

## Quick Access (No Login Required in Dev Mode)

> **DEV MODE BYPASS ACTIVE** - Authentication is disabled when running `npm run dev`

### Direct Dashboard Access

You can now access all dashboards directly without logging in:

#### 🔐 Admin Dashboard
```
http://localhost:8080/admin
```
**Full access to:**
- Orders management
- Menu management  
- Staff management
- Analytics

#### 👔 Waiter Dashboard
```
http://localhost:8080/waiter
```
**Access to:**
- Order queue
- My orders
- Order acceptance and delivery

#### 👨‍🍳 Kitchen Dashboard
```
http://localhost:8080/kitchen
```
**Access to:**
- Active orders
- Print functionality
- Status updates (preparing → ready)

#### 🍽️ Customer Menu
```
http://localhost:8080/
```
**Public access:**
- Menu browsing
- Order placement
- Order history

---

## Production Credentials

When you deploy to production, authentication will be required. Here are the default credentials:

### Admin Account
- **Email:** `admin@fortaleza.com`
- **Password:** `admin123`

### Waiter Account  
- **Email:** `waiter@fortaleza.com`
- **Password:** `waiter123`

---

## How It Works

The DEV MODE BYPASS automatically detects when you're running in development mode (`npm run dev`) and skips all authentication checks in the `ProtectedRoute` component.

**What's bypassed:**
- ✅ Login requirement
- ✅ Role verification
- ✅ Session validation

**What still works:**
- ✅ All dashboard features
- ✅ Database operations
- ✅ Real-time updates
- ✅ Order management

---

## Disabling the Bypass

If you want to test authentication in development:

1. Open `/Users/danieldarsamo/Documents/repos/digital-menu-creator/src/components/auth/ProtectedRoute.tsx`
2. Comment out or remove these lines:
   ```typescript
   // if (isDev) {
   //     console.log('🔓 DEV MODE: Bypassing authentication for', location.pathname);
   //     return <>{children}</>;
   // }
   ```
3. You'll then need to login with the credentials above

---

## Console Logs

When dev bypass is active, you'll see this in the browser console:
```
🔓 DEV MODE: Bypassing authentication for /admin
```

This helps you remember that authentication is disabled.

---

## Security Note

⚠️ **IMPORTANT:** The bypass ONLY works in development mode. When you build for production (`npm run build`), authentication will be fully enforced. Never deploy with `import.meta.env.DEV = true`!
