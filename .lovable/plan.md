

# Complete Database Setup and Menu Seeding Plan

This plan will set up the required database tables, seed the menu data, and create an admin user for testing.

---

## Overview

| Task | Description |
|------|-------------|
| Create menu_categories table | Required by MenuService for category navigation |
| Update menu_items schema | Add missing columns for dietary flags and category reference |
| Seed menu data | Insert 70+ menu items across 13 categories |
| Create admin user | Enable admin dashboard access for testing |

---

## Phase 1: Database Schema Updates

### 1.1 Create menu_categories Table

Create a new table to store menu category metadata:

```sql
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🍽️',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view menu categories"
ON public.menu_categories FOR SELECT
USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage menu categories"
ON public.menu_categories FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
```

### 1.2 Update menu_items Table

Add missing columns to match MenuService expectations:

```sql
-- Add new columns for dietary information
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.menu_categories(id),
ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_seafood BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_kids_friendly BOOLEAN DEFAULT false;

-- Rename 'available' to 'is_available' for consistency
ALTER TABLE public.menu_items
RENAME COLUMN available TO is_available;
```

---

## Phase 2: Seed Menu Data

### 2.1 Insert Categories (13 categories)

Insert all restaurant menu categories with proper ordering:

| Order | Category | Icon |
|-------|----------|------|
| 1 | Entradas | 🥗 |
| 2 | Hambúrgueres | 🍔 |
| 3 | Petiscos | 🍟 |
| 4 | Sopas | 🍲 |
| 5 | Pratos Principais | 🍽️ |
| 6 | Tábuas | 🥩 |
| 7 | Pizzas | 🍕 |
| 8 | Massas | 🍝 |
| 9 | Wraps | 🌯 |
| 10 | Sobremesas | 🍰 |
| 11 | Menu Infantil | 👶 |
| 12 | Bebidas | 🥤 |
| 13 | Vinhos e Cocktails | 🍷 |

### 2.2 Insert Menu Items (70+ items)

Sample items that will be inserted:

**Entradas:**
- Bruscheta Mista - 490 MT (Vegetarian)
- Carpaccio de Carne - 750 MT
- Salada Caesar - 520 MT
- Camarão ao Alho - 890 MT (Seafood)

**Hambúrgueres:**
- Classic Burger - 650 MT
- Bacon Lover - 750 MT
- Fortaleza Burger - 950 MT
- Veggie Burger - 580 MT (Vegetarian)

**Pratos Principais:**
- Picanha Grelhada - 1450 MT
- Camarão à Moçambicana - 1650 MT (Seafood)
- Frango à Cafreal - 890 MT

**And 60+ more items across all categories...**

---

## Phase 3: Create Admin User

Since there are no users in the system yet, I'll create an admin user entry that can be associated once a user signs up.

**Option A: Sign up via the app and then assign admin role**

After creating the user_roles table, run this SQL after someone signs up:

```sql
-- After user signs up, get their ID and assign admin role
INSERT INTO public.user_roles (user_id, role)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@fortaleza.com'),
    'admin'
);
```

**Option B: I can provide a complete SQL script to run after signup**

---

## Phase 4: Update MenuService (Code Fix)

The MenuService needs a small fix to handle the schema properly. Currently it expects `category_id` but should fall back to the `category` column if category_id is null.

```typescript
// Fix mapDbItemToAppItem to handle both schemas
private static mapDbItemToAppItem(dbItem: DBMenuItem): MenuItem {
    return {
        id: dbItem.id,
        name: dbItem.name,
        description: dbItem.description || undefined,
        price: Number(dbItem.price),
        category: dbItem.category_id || dbItem.category, // Fallback
        image: dbItem.image_url || undefined,
        isVegetarian: dbItem.is_vegetarian ?? false,
        isSeafood: dbItem.is_seafood ?? false,
        isKidsFriendly: dbItem.is_kids_friendly ?? false,
    };
}
```

---

## Implementation Order

1. **Create migration** for menu_categories table
2. **Create migration** to update menu_items schema
3. **Run seed SQL** to insert all categories and items
4. **Update MenuService** code to handle schema
5. **Test customer flow** by browsing menu and placing order

---

## Files to Modify

| File | Action |
|------|--------|
| New migration | Create menu_categories table |
| New migration | Update menu_items schema |
| `src/services/menuService.ts` | Fix type handling for backward compatibility |

---

## Test After Implementation

1. Visit the menu page - should see all 13 categories with items
2. Click on items - modal should show with images and dietary badges
3. Add items to cart - cart should calculate totals correctly
4. Place an order - order should save to database with session_id
5. Check order history - should show the placed order

