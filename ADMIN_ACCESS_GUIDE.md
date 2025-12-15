# Admin Access Guide

## 🔐 Secure Admin Access

The admin dashboard is now **password-protected** and hidden from customers. Only authorized staff can access it.

## How to Access Admin Dashboard

### Step 1: Navigate to Admin Login
Go to: **`http://localhost:5173/admin-login`**

Or in production: **`https://yourdomain.com/admin-login`**

### Step 2: Enter Password
Default password: **`fortaleza2024`**

### Step 3: Access Dashboard
After successful login, you'll be redirected to the admin dashboard.

## Important Security Notes

### 🔒 Password Protection
- The admin button has been **removed** from the customer-facing menu
- Customers cannot see or access the admin panel
- Only staff with the password can access `/admin-login`
- Sessions are stored in browser sessionStorage (cleared when browser closes)

### 🔑 Changing the Password
To change the admin password:

1. Open `/src/pages/AdminLogin.tsx`
2. Find line 13:
   ```typescript
   const ADMIN_PASSWORD = "fortaleza2024";
   ```
3. Change `"fortaleza2024"` to your desired password
4. Save the file

**⚠️ Important**: Change this password before deploying to production!

### 🚪 Logout
Click the **"Sair"** (Logout) button in the top-right corner of the admin dashboard to end your session.

## Access URLs

| Page | URL | Access |
|------|-----|--------|
| Customer Menu | `/` | Public |
| Admin Login | `/admin-login` | Password Required |
| Admin Dashboard | `/admin` | Requires Login |

## Features Protected

The following features are now admin-only:
- ✅ View all orders
- ✅ Update order status
- ✅ Delete orders
- ✅ View order statistics
- ✅ Filter orders by status
- ✅ Real-time order updates

## Session Management

- **Login**: Enter password at `/admin-login`
- **Session**: Stored in browser sessionStorage
- **Logout**: Click "Sair" button or close browser
- **Auto-redirect**: Accessing `/admin` without login redirects to `/admin-login`

## For Production Deployment

Before deploying to production:

1. **Change the password** in `AdminLogin.tsx`
2. **Remove the password hint** from the login page (lines 99-102)
3. Consider implementing:
   - Backend authentication
   - JWT tokens
   - Role-based access control
   - Password hashing
   - Multi-user support

## Sharing Access with Staff

To give staff access to the admin panel:

1. Share the admin login URL: `/admin-login`
2. Provide them with the password
3. Instruct them to bookmark the login page for easy access

**Note**: The admin login page is not linked from the customer menu, so staff must access it directly via URL.

## Troubleshooting

**Q: I forgot the password**
- Check `/src/pages/AdminLogin.tsx` line 13 for the current password

**Q: I'm logged out automatically**
- Sessions expire when you close the browser
- Click "Sair" (Logout) ends the session immediately

**Q: Can't access admin dashboard**
- Make sure you've logged in at `/admin-login` first
- Check that you're using the correct password

**Q: Customers can see the admin button**
- The admin button has been removed from the customer menu
- Only the login page URL provides access
