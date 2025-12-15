# Admin Access Guide

## 🔐 Secure Admin Access

The admin dashboard is **password-protected** and hidden from customers. Only authorized staff can access it.

## 🌐 Access URLs

### Production URLs (fortelezamenu.com)

| Page | URL | Description |
|------|-----|-------------|
| **Customer Menu** | `https://fortelezamenu.com/` | Public menu for customers |
| **Admin Login** | `https://fortelezamenu.com/admin-login` | Password-protected login page |
| **Admin Dashboard** | `https://fortelezamenu.com/admin` | Order management (requires login) |

### Development URLs (localhost)

| Page | URL | Description |
|------|-----|-------------|
| **Customer Menu** | `http://localhost:5173/` | Public menu for customers |
| **Admin Login** | `http://localhost:5173/admin-login` | Password-protected login page |
| **Admin Dashboard** | `http://localhost:5173/admin` | Order management (requires login) |

## 📱 How to Access Admin Dashboard

### Method 1: Direct URL (Recommended)
1. Navigate to: **`https://fortelezamenu.com/admin-login`**
2. Enter password: **`fortaleza2024`**
3. Click "Entrar" (Login)
4. You'll be redirected to the admin dashboard

### Method 2: Via /admin URL
1. Navigate to: **`https://fortelezamenu.com/admin`**
2. If not logged in, you'll be automatically redirected to `/admin-login`
3. Enter password and login
4. You'll be taken to the admin dashboard

## 🔑 Default Password

**Password**: `fortaleza2024`

**⚠️ IMPORTANT**: Change this password before deploying to production!

### How to Change Password

1. Open `/src/pages/AdminLogin.tsx`
2. Find line 13:
   ```typescript
   const ADMIN_PASSWORD = "fortaleza2024";
   ```
3. Change `"fortaleza2024"` to your desired password
4. Save the file

## 🚪 Logout

Click the **"Sair"** (Logout) button in the top-right corner of the admin dashboard to end your session.

## 🔒 Security Features

### Protected Routes
- ✅ Admin button **removed** from customer menu
- ✅ `/admin` route requires authentication
- ✅ Automatic redirect to login if not authenticated
- ✅ Session-based authentication (sessionStorage)
- ✅ Session expires when browser closes

### Customer Privacy
- ❌ Customers **cannot see** admin controls
- ❌ No visible links to admin panel on customer pages
- ✅ Only staff with password can access admin features

## 📋 Admin Dashboard Features

Once logged in, you can:
- ✅ View all orders in real-time
- ✅ Update order status (pending → confirmed → preparing → ready → delivered)
- ✅ Delete orders
- ✅ View order statistics
- ✅ Filter orders by status
- ✅ See customer information (name, table, notes)
- ✅ Track which orders were sent via WhatsApp/Admin system

## 🌐 Sharing Access with Staff

### For Staff Members:
1. **Bookmark this URL**: `https://fortelezamenu.com/admin-login`
2. **Password**: `fortaleza2024` (or your custom password)
3. **Login** and start managing orders!

### For Restaurant Owner:
- Share the admin login URL with authorized staff only
- Provide them with the password
- Consider changing the password periodically
- Instruct staff to logout when done

## 🔄 Session Management

- **Login**: Enter password at `/admin-login`
- **Session Duration**: Until browser is closed
- **Logout**: Click "Sair" button or close browser
- **Auto-redirect**: Accessing `/admin` without login redirects to `/admin-login`

## 🛡️ For Production Deployment

Before deploying to production:

### 1. Change the Password
```typescript
// In /src/pages/AdminLogin.tsx
const ADMIN_PASSWORD = "your-secure-password-here";
```

### 2. Remove Password Hint
Delete or comment out lines 99-102 in `AdminLogin.tsx`:
```typescript
// Remove this section:
<div className="mt-6 text-center text-sm text-muted-foreground font-body">
  <p>Senha padrão: <code>fortaleza2024</code></p>
  <p className="text-xs mt-2">Altere a senha no código para produção</p>
</div>
```

### 3. Consider Additional Security
- Implement backend authentication
- Use JWT tokens
- Add rate limiting
- Enable HTTPS
- Use environment variables for sensitive data

## 🆘 Troubleshooting

### Q: I can't access /admin
**A**: You need to login first at `/admin-login`. The system will automatically redirect you.

### Q: I forgot the password
**A**: Check `/src/pages/AdminLogin.tsx` line 13 for the current password.

### Q: I'm logged out automatically
**A**: Sessions expire when you close the browser. This is a security feature.

### Q: The admin button is visible to customers
**A**: The admin button has been removed. Customers cannot see it. Access is only via direct URL.

### Q: Can I access admin from my phone?
**A**: Yes! Just navigate to `fortelezamenu.com/admin-login` on your mobile browser.

## 📊 URL Structure Summary

```
fortelezamenu.com/
├── /                    → Customer Menu (Public)
├── /admin-login         → Admin Login (Password Required)
└── /admin              → Admin Dashboard (Requires Login)
```

## 🎯 Quick Access Guide

**For Customers**: Just visit `fortelezamenu.com`

**For Staff**:
1. Visit `fortelezamenu.com/admin-login`
2. Enter password
3. Manage orders at `fortelezamenu.com/admin`

That's it! The routing is simple and secure. 🎉
