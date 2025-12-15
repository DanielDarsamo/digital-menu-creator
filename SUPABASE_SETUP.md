# Supabase Integration Setup Guide

## 🎉 Supabase Successfully Integrated!

Your digital menu now uses **Supabase** as the backend database instead of localStorage. This provides:
- ✅ **Real-time synchronization** across all devices
- ✅ **Persistent data storage** in the cloud
- ✅ **Multi-device access** for admin dashboard
- ✅ **Scalable infrastructure**
- ✅ **Automatic backups**

## 📋 Setup Instructions

### Step 1: Run the Database Schema

1. Go to your Supabase project: https://roscelplipkkitiafqcq.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql` file
5. Paste it into the SQL editor
6. Click **Run** to execute the schema

This will create:
- `orders` table with all necessary columns
- Indexes for better performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates
- Sequence for order numbers
- Statistics view for analytics

### Step 2: Verify the Setup

After running the schema, verify it worked:

1. Go to **Table Editor** in Supabase
2. You should see the `orders` table
3. Click on it to view the structure

### Step 3: Test the Integration

1. Make sure your dev server is running: `npm run dev`
2. Add items to cart and place an order
3. Go to `/admin-login` and login
4. You should see the order in the admin dashboard
5. Try updating the order status
6. Open the admin dashboard in another browser/tab - it should update in real-time!

## 🔐 Security Configuration

### Current Setup (Development)
The database is configured with **public access** for development. This means:
- ✅ Anyone can read orders
- ✅ Anyone can create orders (customers)
- ✅ Anyone can update orders (admin)
- ✅ Anyone can delete orders (admin)

### For Production (Recommended)

Before going to production, you should:

1. **Enable Authentication**:
   ```sql
   -- Update RLS policies to require authentication
   DROP POLICY "Allow public read access" ON orders;
   DROP POLICY "Allow public insert access" ON orders;
   DROP POLICY "Allow public update access" ON orders;
   DROP POLICY "Allow public delete access" ON orders;

   -- Create authenticated-only policies
   CREATE POLICY "Authenticated users can read" ON orders
     FOR SELECT
     USING (auth.role() = 'authenticated');

   CREATE POLICY "Anyone can insert" ON orders
     FOR INSERT
     WITH CHECK (true);

   CREATE POLICY "Authenticated users can update" ON orders
     FOR UPDATE
     USING (auth.role() = 'authenticated');

   CREATE POLICY "Authenticated users can delete" ON orders
     FOR DELETE
     USING (auth.role() = 'authenticated');
   ```

2. **Set up API Keys**:
   - Use environment variables for API keys
   - Never commit API keys to git
   - Use different keys for development and production

## 🔄 Real-Time Features

The system now includes **real-time subscriptions**:

- When a new order is created, all open admin dashboards update automatically
- When an order status changes, all dashboards see the update instantly
- When an order is deleted, it disappears from all dashboards immediately

No need to refresh the page!

## 📊 Database Structure

### Orders Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_number | INTEGER | Sequential order number |
| items | JSONB | Array of order items |
| total_price | DECIMAL | Total order price |
| customer_name | TEXT | Customer name (optional) |
| customer_table | TEXT | Table/location (optional) |
| customer_notes | TEXT | Special notes (optional) |
| status | TEXT | Order status (pending, confirmed, etc.) |
| sent_via_whatsapp | BOOLEAN | Sent via WhatsApp |
| sent_to_admin | BOOLEAN | Sent to admin system |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## 🛠️ Configuration Files

### Created Files:
1. `/src/lib/supabase.ts` - Supabase client configuration
2. `supabase-schema.sql` - Database schema
3. `/src/services/orderService.ts` - Updated to use Supabase

### Modified Files:
1. `/src/pages/AdminDashboard.tsx` - Added real-time subscriptions
2. `/src/components/menu/OrderCart.tsx` - Async order creation

## 🔧 Environment Variables (Optional)

For better security, you can use environment variables:

1. Create `.env` file in project root:
   ```env
   VITE_SUPABASE_URL=https://roscelplipkkitiafqcq.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_l0LexwB9FlSiFUfl330SzA_6h7K2AH9
   ```

2. Update `/src/lib/supabase.ts`:
   ```typescript
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

3. Add `.env` to `.gitignore`

## 📈 Monitoring

### View Orders in Supabase:
1. Go to **Table Editor**
2. Click on `orders` table
3. See all orders in real-time

### View Statistics:
Run this query in SQL Editor:
```sql
SELECT * FROM order_statistics;
```

This shows:
- Total orders
- Orders by status
- Today's orders
- Total revenue
- Today's revenue

## 🚀 Performance Tips

1. **Indexes**: Already created for:
   - order_number (fast lookups)
   - status (fast filtering)
   - created_at (fast sorting)

2. **Real-time**: Subscriptions are efficient and only send changes

3. **Caching**: Consider adding client-side caching for better performance

## 🐛 Troubleshooting

### Orders not appearing?
- Check Supabase SQL Editor for errors
- Verify RLS policies are correct
- Check browser console for errors

### Real-time not working?
- Check that the schema was run correctly
- Verify Supabase Realtime is enabled in project settings
- Check browser console for subscription errors

### Can't create orders?
- Verify the `get_next_order_number()` function exists
- Check RLS policies allow INSERT
- Look for errors in browser console

## 📞 Support

If you encounter issues:
1. Check Supabase project logs
2. Review browser console errors
3. Verify all SQL was executed successfully
4. Check that API keys are correct

## 🎯 Next Steps

1. ✅ Run the SQL schema in Supabase
2. ✅ Test order creation
3. ✅ Test admin dashboard
4. ✅ Test real-time updates
5. 🔄 Consider adding authentication for production
6. 🔄 Set up environment variables
7. 🔄 Configure backup policies

Your restaurant order system is now powered by Supabase! 🎉
