
import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { MenuItem, MenuCategory } from "@/data/menuData";

export interface DBMenuItem {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_vegetarian: boolean;
    is_seafood: boolean;
    is_kids_friendly: boolean;
    is_available: boolean;
}

export interface DBMenuCategory {
    id: string;
    name: string;
    icon: string;
    sort_order: number;
}

export class MenuService {
    static async getFullMenu(client: SupabaseClient = supabase): Promise<MenuCategory[]> {
        try {
            // Fetch categories
            const { data: categories, error: catError } = await client
                .from('menu_categories')
                .select('*')
                .order('sort_order', { ascending: true });

            if (catError) throw catError;

            // Fetch all items
            const { data: items, error: itemError } = await client
                .from('menu_items')
                .select('*')
                .order('name', { ascending: true });

            if (itemError) throw itemError;

            // Map items to categories
            return categories.map((cat: DBMenuCategory) => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon,
                items: items
                    .filter((item: DBMenuItem) => item.category_id === cat.id)
                    .map(this.mapDbItemToAppItem)
            }));
        } catch (error) {
            console.error('Error fetching menu:', error);
            return [];
        }
    }

    static async updateItem(id: string, updates: Partial<DBMenuItem>, client: SupabaseClient = supabase) {
        const { data, error } = await client
            .from('menu_items')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapDbItemToAppItem(data);
    }

    static async createCategory(category: Omit<DBMenuCategory, "id">, client: SupabaseClient = supabase) {
        const { data, error } = await client
            .from('menu_categories')
            .insert(category)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async createItem(item: Omit<DBMenuItem, "id" | "created_at">, client: SupabaseClient = supabase) {
        const { data, error } = await client
            .from('menu_items')
            .insert(item)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async seedDatabase(client: SupabaseClient = supabase) {
        const { menuCategories } = await import('@/data/menuData');

        let createdCount = 0;
        console.log("Starting seed...");

        for (const cat of menuCategories) {
            // Check if category already exists by name to avoid duplicates
            const { data: existing } = await client
                .from('menu_categories')
                .select('id')
                .eq('name', cat.name)
                .single();

            let categoryId = existing?.id;

            if (!categoryId) {
                const newCat = await this.createCategory({
                    name: cat.name,
                    icon: cat.icon,
                    sort_order: 0 // You might want to map index to sort_order
                }, client);
                categoryId = newCat.id;
            }

            for (const item of cat.items) {
                // Check if item exists
                const { data: existingItem } = await client
                    .from('menu_items')
                    .select('id')
                    .eq('name', item.name)
                    .eq('category_id', categoryId)
                    .single();

                if (!existingItem) {
                    await this.createItem({
                        category_id: categoryId,
                        name: item.name,
                        description: item.description || null,
                        price: typeof item.price === 'string' ? parseFloat(item.price.split('/')[0]) : item.price, // Handle "180 / 850" format crudely for now or split
                        image_url: item.image || null,
                        is_vegetarian: item.isVegetarian || false,
                        is_seafood: item.isSeafood || false,
                        is_kids_friendly: item.isKidsFriendly || false,
                        is_available: true
                    }, client);
                    createdCount++;
                }
            }
        }
        return createdCount;
    }

    // Helper to map DB structure (snake_case) to App structure (camelCase)
    private static mapDbItemToAppItem(dbItem: DBMenuItem): MenuItem {
        return {
            id: dbItem.id,
            name: dbItem.name,
            description: dbItem.description || undefined,
            price: Number(dbItem.price), // Ensure number
            category: dbItem.category_id,
            image: dbItem.image_url || undefined,
            isVegetarian: dbItem.is_vegetarian,
            isSeafood: dbItem.is_seafood,
            isKidsFriendly: dbItem.is_kids_friendly,
        };
    }
}
