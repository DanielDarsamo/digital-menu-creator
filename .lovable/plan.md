

# Complete Fix Plan for Fortaleza de Sabores

This plan addresses all identified issues including the build error, broken customer order tracking, and security improvements.

---

## Summary of Changes

| Priority | Issue | Files Affected |
|----------|-------|----------------|
| Critical | Build error - missing `draft` status in OrderCard | `src/components/shared/OrderCard.tsx` |
| High | Customer order tracking uses deprecated localStorage | `src/components/menu/OrderStatus.tsx`, `src/components/menu/OrderHistory.tsx` |
| High | OrderService needs session-based query method | `src/services/orderService.ts` |
| Medium | Security - Move roles to separate table | New migration file |

---

## Phase 1: Fix Build Error

**File: `src/components/shared/OrderCard.tsx`**

Add the missing `draft` status to the `statusConfig` object at line 56:

```typescript
const statusConfig: Record<Order['status'], { label: string; icon: any; color: string }> = {
    draft: {
        label: "Rascunho",
        icon: Clock,
        color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    },
    pending: {
        label: "Pendente",
        icon: Clock,
        color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    },
    // ... rest of existing statuses
};
```

---

## Phase 2: Add Session-Based Order Query

**File: `src/services/orderService.ts`**

Add a new method to fetch orders by session ID:

```typescript
static async getOrdersBySessionId(sessionId: string, client: SupabaseClient = supabase): Promise<Order[]> {
    try {
        const { data, error } = await client
            .from('orders')
            .select('*')
            .eq('customer_session_id', sessionId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data ? data.map(this.dbToOrder) : [];
    } catch (error) {
        console.error('Failed to fetch session orders:', error);
        return [];
    }
}
```

---

## Phase 3: Fix Customer Order Tracking

### 3A. Update OrderStatus Component

**File: `src/components/menu/OrderStatus.tsx`**

Replace the deprecated `localStorage.getItem("customerDetails")` pattern with the `useSession` hook:

**Changes:**
- Import `useSession` from `SessionContext`
- Use `session.id` to fetch orders via the new `getOrdersBySessionId` method
- Remove the deprecated email/phone lookup

```typescript
import { useSession } from "@/contexts/SessionContext";

const OrderStatus = () => {
    const { session } = useSession();
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        if (!session?.id) {
            setLoading(false);
            return;
        }

        try {
            const allOrders = await OrderService.getOrdersBySessionId(session.id);
            const active = allOrders.filter(o =>
                ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
            );
            setActiveOrders(active);
        } catch (e) {
            console.error("Failed to load active orders", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
        // ... subscription logic remains the same
    }, [session?.id]);
    
    // ... rest of component unchanged
};
```

### 3B. Update OrderHistory Component

**File: `src/components/menu/OrderHistory.tsx`**

Same pattern - replace localStorage with `useSession`:

```typescript
import { useSession } from "@/contexts/SessionContext";

const OrderHistory = () => {
    const { session } = useSession();
    // ... existing state

    const loadHistory = async () => {
        if (!session?.id) {
            setLoading(false);
            return;
        }

        try {
            const allOrders = await OrderService.getOrdersBySessionId(session.id);
            const history = allOrders.filter(o =>
                ['delivered', 'cancelled'].includes(o.status)
            );
            setOrders(history);
        } catch (e) {
            console.error("Failed to load order history", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
        // ... subscription logic unchanged
    }, [session?.id]);
    
    // ... rest unchanged
};
```

---

## Phase 4: Security - Create User Roles Table (Migration)

**New File: `supabase/migrations/007_create_user_roles.sql`**

This follows Supabase security best practices by storing roles in a separate table with SECURITY DEFINER functions to prevent privilege escalation.

```sql
-- Migration 007: Create secure user_roles table
-- Following Supabase security best practices for role management

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'waiter', 'chef');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create SECURITY DEFINER function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- 5. Create SECURITY DEFINER function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- 6. RLS Policies for user_roles table
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Migrate existing roles from profiles table (if any exist)
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. Update helper functions to use new table
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role(auth.uid(), 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_waiter() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role(auth.uid(), 'waiter');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_chef() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role(auth.uid(), 'chef');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Phase 5: Update AuthContext to Use New Roles Table

**File: `src/contexts/AuthContext.tsx`**

Update the `fetchUserRole` function to query from `user_roles` table instead of `profiles`:

```typescript
const fetchUserRole = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Error fetching role:', error);
            setRole(null);
        } else {
            setRole(data?.role as UserRole);
        }
    } catch (err) {
        console.error('Unexpected error fetching role:', err);
        setRole(null);
    } finally {
        setLoading(false);
    }
};
```

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/shared/OrderCard.tsx` | Modify | Add missing `draft` status |
| `src/services/orderService.ts` | Modify | Add `getOrdersBySessionId` method |
| `src/components/menu/OrderStatus.tsx` | Modify | Use SessionContext instead of localStorage |
| `src/components/menu/OrderHistory.tsx` | Modify | Use SessionContext instead of localStorage |
| `supabase/migrations/007_create_user_roles.sql` | Create | New secure roles table |
| `src/contexts/AuthContext.tsx` | Modify | Query from user_roles table |

---

## Testing Checklist

After implementation, verify:

1. **Build succeeds** - No TypeScript errors
2. **Customer flow** - Add items to cart, place order, see order status update
3. **Order history** - Past orders display correctly for the session
4. **Admin login** - Can access admin dashboard with proper role
5. **Waiter login** - Can access waiter dashboard with proper role
6. **Kitchen view** - Can view and update order statuses

